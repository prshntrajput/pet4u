'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPetById, clearCurrentPet } from '@/lib/store/slices/petSlice';
import { createAdoptionRequest } from '@/lib/store/slices/adoptionSlice';
import { appointmentsAPI } from '@/lib/api/appointments';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  Mail,
  Share2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  CalendarCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import PetReviewsSection from '@/app/_component/pets/PetReviewsSection';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getUpcomingDates(dayOfWeek, count = 5) {
  const dates = [];
  let current = addDays(new Date(), 1);
  while (dates.length < count) {
    if (current.getDay() === dayOfWeek) dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentPet, isLoading, error } = useSelector((state) => state.pets);
  const { user } = useSelector((state) => state.auth);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Adoption request dialog
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  // Visit booking dialog
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [upcomingDates, setUpcomingDates] = useState([]);

  useEffect(() => {
    if (params?.petId) {
      dispatch(fetchPetById(params.petId));
    }
    return () => { dispatch(clearCurrentPet()); };
  }, [params?.petId, dispatch]);

  const loadAvailability = useCallback(async (shelterId) => {
    setSlotsLoading(true);
    try {
      const res = await appointmentsAPI.getShelterAvailability(shelterId);
      if (res.success) {
        setAvailabilitySlots(res.data.data?.slots || []);
      }
    } catch {
      toast.error('Could not load availability.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleOpenVisitDialog = () => {
    if (!user) { toast.error('Please login first'); router.push('/login'); return; }
    if (user.role !== 'adopter') { toast.error('Only adopters can book visits'); return; }
    setSelectedSlot(null);
    setSelectedDate(null);
    setUpcomingDates([]);
    setVisitNotes('');
    setShowVisitDialog(true);
    loadAvailability(pet.ownerId);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate(null);
    setUpcomingDates(getUpcomingDates(slot.dayOfWeek));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const handleBookVisit = async () => {
    if (!selectedSlot || !selectedDate) {
      toast.error('Please select a time slot and date');
      return;
    }
    setIsBooking(true);
    try {
      const res = await appointmentsAPI.bookAppointment({
        shelterId: pet.ownerId,
        petId: pet.id,
        scheduledDate: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        adopterNotes: visitNotes.trim() || null,
      });
      if (res.success) {
        toast.success('Visit request sent! The shelter will confirm shortly.');
        setShowVisitDialog(false);
        setTimeout(() => router.push('/appointments'), 1500);
      } else {
        toast.error(res.error || 'Failed to book visit');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !currentPet) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'This pet listing could not be found.'}</p>
        <Button onClick={() => router.push('/pets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pets
        </Button>
      </div>
    );
  }

  const pet = currentPet;
  const images = pet.images || [];
  const displayImages = images.length > 0 ? images : (pet.primaryImage ? [{ imageUrl: pet.primaryImage }] : []);

  const getAgeDisplay = () => {
    if (!pet.age) return 'Age unknown';
    const unit = pet.ageUnit === 'years' ? 'year' : 'month';
    return `${pet.age} ${unit}${pet.age > 1 ? 's' : ''} old`;
  };

  const handleFavoriteToggle = () => {
    if (!user) { toast.error('Please login to save favorites'); router.push('/login'); return; }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Meet ${pet.name}`, text: pet.description || `Check out ${pet.name}!`, url: window.location.href });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Failed to share');
    }
  };

  const handleAdoptionRequest = async () => {
    if (!user) { toast.error('Please login'); router.push('/login'); return; }
    if (user.role !== 'adopter') { toast.error('Only adopters can send adoption requests'); return; }
    if (!requestMessage.trim() || requestMessage.length < 20) {
      toast.error('Please provide a detailed message (at least 20 characters)');
      return;
    }
    setIsRequesting(true);
    try {
      await dispatch(createAdoptionRequest({ petId: pet.id, message: requestMessage.trim() })).unwrap();
      toast.success('Adoption request sent successfully!');
      setShowRequestDialog(false);
      setRequestMessage('');
      setTimeout(() => router.push('/my-requests'), 1500);
    } catch (err) {
      toast.error(err || 'Failed to send adoption request');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenRequestDialog = () => {
    if (!user) { toast.error('Please login'); router.push('/login'); return; }
    if (user.role !== 'adopter') { toast.error('Only adopters can send adoption requests'); return; }
    setShowRequestDialog(true);
  };

  const isOwner = user?.id === pet.ownerId || user?.userId === pet.ownerId;
  const canAct = user?.role === 'adopter' && !isOwner && pet.adoptionStatus === 'available';

  return (
    <>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {displayImages[selectedImageIndex]?.imageUrl ? (
                  <Image
                    src={displayImages[selectedImageIndex].imageUrl}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-8xl">🐾</div>
                )}
              </div>
            </Card>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-blue-600 scale-105' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {image.imageUrl ? (
                      <Image src={image.imageUrl} alt={`${pet.name} - ${index + 1}`} fill className="object-cover" sizes="100px" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">🐾</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">About {pet.name}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{pet.description || 'No description available.'}</p>
                </div>
                {pet.story && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Story</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{pet.story}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Health Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    {pet.isVaccinated ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="text-sm">Vaccinated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pet.isNeutered || pet.isSpayed ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="text-sm">Neutered/Spayed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pet.houseTrained ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="text-sm">House Trained</span>
                  </div>
                </div>
                {pet.medicalHistory && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medical History</h4>
                    <p className="text-sm text-gray-700">{pet.medicalHistory}</p>
                  </div>
                )}
                {pet.specialNeeds && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Needs</h4>
                    <p className="text-sm text-gray-700">{pet.specialNeeds}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Behavioral Traits</h3>
                <div className="grid grid-cols-2 gap-4">
                  {pet.goodWithKids !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithKids ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">Good with Kids</span>
                    </div>
                  )}
                  {pet.goodWithDogs !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithDogs ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">Good with Dogs</span>
                    </div>
                  )}
                  {pet.goodWithCats !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithCats ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">Good with Cats</span>
                    </div>
                  )}
                  {pet.goodWithPets !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithPets ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">Good with Other Pets</span>
                    </div>
                  )}
                </div>
                {pet.energyLevel && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Energy Level</h4>
                    <Badge variant="secondary" className="capitalize">{pet.energyLevel}</Badge>
                  </div>
                )}
                {pet.trainedLevel && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Training Level</h4>
                    <Badge variant="secondary" className="capitalize">{pet.trainedLevel.replace('_', ' ')}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                    {pet.isUrgent && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle size={14} /><span>Urgent</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-600">
                    {pet.breed || (pet.species ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1) : 'Pet')}
                  </p>
                </div>

                <div>
                  <Badge
                    variant={pet.adoptionStatus === 'available' ? 'success' : pet.adoptionStatus === 'pending' ? 'secondary' : 'default'}
                    className="text-sm"
                  >
                    {pet.adoptionStatus ? pet.adoptionStatus.charAt(0).toUpperCase() + pet.adoptionStatus.slice(1) : 'Unknown'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{getAgeDisplay()}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Ruler className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="capitalize">{pet.gender || 'Unknown'}</span>
                    {pet.size && <span className="ml-2">• {pet.size.replace('_', ' ')}</span>}
                  </div>
                  {pet.weight && (
                    <div className="flex items-center text-gray-700">
                      <Weight className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{pet.weight} kg</span>
                    </div>
                  )}
                  {(pet.city || pet.state) && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{pet.city}{pet.city && pet.state ? ', ' : ''}{pet.state}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  {isOwner ? (
                    <Button className="w-full" size="lg" disabled>Your Listing</Button>
                  ) : pet.adoptionStatus !== 'available' ? (
                    <Button className="w-full" size="lg" disabled>Not Available</Button>
                  ) : user?.role === 'adopter' ? (
                    <>
                      <Button className="w-full" size="lg" onClick={handleOpenRequestDialog}>
                        Send Adoption Request
                      </Button>
                      <Button className="w-full" size="lg" variant="outline" onClick={handleOpenVisitDialog}>
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Request a Visit
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" size="lg" onClick={() => { toast.info('Sign in as an adopter to adopt this pet'); router.push('/login'); }}>
                      Sign in to Adopt
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleFavoriteToggle}>
                      <Heart size={18} className={`mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 size={18} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {pet.owner && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pet.owner.role === 'shelter' ? 'Shelter Information' : 'Owner Information'}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pet.owner.profileImage} alt={pet.owner.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {pet.owner.name?.charAt(0).toUpperCase() || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{pet.owner.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600 capitalize">{pet.owner.role || 'Owner'}</div>
                    </div>
                  </div>
                  {(pet.owner.city || pet.owner.state) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {pet.owner.city}{pet.owner.city && pet.owner.state ? ', ' : ''}{pet.owner.state}
                    </div>
                  )}
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" className="w-full" size="sm" onClick={() => router.push(`/messages/${pet.owner.id}`)}>
                      <Mail size={16} className="mr-2" />Send Message
                    </Button>
                    {pet.owner.role === 'shelter' && (
                      <Button variant="outline" className="w-full" size="sm" onClick={() => router.push(`/shelters/${pet.owner.id}`)}>
                        View Shelter Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {pet.isUrgent && pet.urgentReason && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Urgent Adoption</h4>
                      <p className="text-sm text-red-800">{pet.urgentReason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <PetReviewsSection petId={pet.id} canReview={user?.role === 'adopter' && !isOwner} />
      </div>

      {/* ── Adoption Request Dialog ── */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Adoption Request</DialogTitle>
            <DialogDescription>
              Tell {pet.owner?.role === 'shelter' ? 'the shelter' : 'the owner'} why you want to adopt {pet.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Explain why you would be a good fit for this pet, your experience with pets, your living situation, etc..."
                rows={6}
                maxLength={1000}
                className={requestMessage.length > 0 && requestMessage.length < 20 ? 'border-red-500' : ''}
              />
              <p className={`text-xs ${requestMessage.length < 20 && requestMessage.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {requestMessage.length}/1000 characters
                {requestMessage.length < 20 && requestMessage.length > 0 && ' (minimum 20 required)'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRequestDialog(false); setRequestMessage(''); }} disabled={isRequesting}>
              Cancel
            </Button>
            <Button onClick={handleAdoptionRequest} disabled={isRequesting || requestMessage.length < 20}>
              {isRequesting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Book a Visit Dialog ── */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Request a Visit
            </DialogTitle>
            <DialogDescription>
              Book a meet-and-greet with {pet.name} at {pet.owner?.name || 'the shelter'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Step 1 — pick a time slot */}
            <div>
              <p className="text-sm font-semibold mb-2">1. Choose a time slot</p>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading availability…
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  This shelter hasn't set up visit times yet.<br />
                  Try messaging them directly.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availabilitySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSelectSlot(slot)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        selectedSlot?.id === slot.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{DAY_NAMES[slot.dayOfWeek]}</p>
                        <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 — pick a date */}
            {selectedSlot && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  2. Choose a date <span className="font-normal text-muted-foreground">(upcoming {DAY_NAMES[selectedSlot.dayOfWeek]}s)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {upcomingDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleSelectDate(date)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-primary bg-primary text-primary-foreground font-semibold'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      {format(date, 'EEE, MMM d')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation summary */}
            {selectedSlot && selectedDate && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Visit details
                </p>
                <p className="text-foreground">
                  <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d yyyy')}</span>
                </p>
                <p className="text-muted-foreground">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold mb-2">3. Notes <span className="font-normal text-muted-foreground">(optional)</span></p>
              <Textarea
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Any questions for the shelter, accessibility needs, who will be attending, etc."
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitDialog(false)} disabled={isBooking}>
              Cancel
            </Button>
            <Button
              onClick={handleBookVisit}
              disabled={isBooking || !selectedSlot || !selectedDate}
            >
              {isBooking
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking…</>
                : <><CalendarCheck className="mr-2 h-4 w-4" />Request Visit</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
