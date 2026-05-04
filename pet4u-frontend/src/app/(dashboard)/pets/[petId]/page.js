'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPetById, clearCurrentPet } from '@/lib/store/slices/petSlice';
import { createAdoptionRequest } from '@/lib/store/slices/adoptionSlice';
import { addFavorite, removeFavorite, checkFavorite } from '@/lib/store/slices/favoriteSlice';
import { appointmentsAPI } from '@/lib/api/appointments';
import { messageAPI } from '@/lib/api/messages';
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
  Mail,
  Share2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  CalendarCheck,
  PawPrint,
  Lock,
  Calendar,
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

function HealthRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {value
        ? <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        : <XCircle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
      }
      <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentPet, isLoading, error } = useSelector((state) => state.pets);
  const { user } = useSelector((state) => state.auth);
  const { favoritedPetIds } = useSelector((state) => state.favorites);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const [canMessage, setCanMessage] = useState(false);

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
      if (user) dispatch(checkFavorite(params.petId));
    }
    return () => { dispatch(clearCurrentPet()); };
  }, [params?.petId, dispatch, user]);

  useEffect(() => {
    if (currentPet) setIsFavorite(favoritedPetIds.includes(currentPet.id));
  }, [favoritedPetIds, currentPet]);

  useEffect(() => {
    if (!currentPet || !user) return;
    const isOwnerCheck = user.id === currentPet.ownerId || user.userId === currentPet.ownerId;
    if (isOwnerCheck || user.role !== 'adopter') return;
    messageAPI.canMessage(currentPet.ownerId)
      .then((res) => setCanMessage(res.success && res.data?.data?.canMessage))
      .catch(() => setCanMessage(false));
  }, [currentPet?.id, user?.id]);

  const loadAvailability = useCallback(async (shelterId) => {
    setSlotsLoading(true);
    try {
      const res = await appointmentsAPI.getShelterAvailability(shelterId);
      if (res.success) setAvailabilitySlots(res.data.data?.slots || []);
    } catch {
      toast.error('Could not load availability.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleOpenVisitDialog = () => {
    if (!user) { toast.error('Please login first'); router.push('/login'); return; }
    if (user.role !== 'adopter') { toast.error('Only adopters can book visits'); return; }
    setSelectedSlot(null); setSelectedDate(null); setUpcomingDates([]); setVisitNotes('');
    setShowVisitDialog(true);
    loadAvailability(pet.ownerId);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate(null);
    setUpcomingDates(getUpcomingDates(slot.dayOfWeek));
  };

  const handleBookVisit = async () => {
    if (!selectedSlot || !selectedDate) { toast.error('Please select a time slot and date'); return; }
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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !currentPet) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pet Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'This pet listing could not be found.'}</p>
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
    if (!pet.age) return 'Unknown';
    const unit = pet.ageUnit === 'years' ? 'year' : 'month';
    return `${pet.age} ${unit}${pet.age > 1 ? 's' : ''}`;
  };

  const handleFavoriteToggle = async () => {
    if (!user) { toast.error('Please login to save favorites'); router.push('/login'); return; }
    if (isFavorite) {
      await dispatch(removeFavorite(pet.id)).unwrap();
      toast.success('Removed from favorites');
    } else {
      await dispatch(addFavorite(pet.id)).unwrap();
      toast.success('Added to favorites');
    }
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

  return (
    <>
      <div className="space-y-4">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-1">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>

        {/* ── Top: Image + Key Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

          {/* Images – 3/5 */}
          <div className="lg:col-span-3 space-y-2">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
              {displayImages[selectedImageIndex]?.imageUrl ? (
                <Image
                  src={displayImages[selectedImageIndex].imageUrl}
                  alt={pet.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PawPrint className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {image.imageUrl ? (
                      <Image src={image.imageUrl} alt={`${pet.name} ${index + 1}`} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <PawPrint className="h-5 w-5 text-muted-foreground/25" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info – 2/5 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Name + status */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold leading-tight">{pet.name}</h1>
                {pet.isUrgent && (
                  <Badge variant="destructive" className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    <AlertCircle size={11} /> Urgent
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {pet.breed || (pet.species ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1) : 'Pet')}
              </p>
              <Badge
                variant={pet.adoptionStatus === 'available' ? 'default' : 'secondary'}
                className="mt-2 capitalize"
              >
                {pet.adoptionStatus || 'Unknown'}
              </Badge>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Age</p>
                <p className="font-semibold text-sm mt-0.5">{getAgeDisplay()}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Gender</p>
                <p className="font-semibold text-sm mt-0.5 capitalize">{pet.gender || '—'}</p>
              </div>
              {pet.size && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Size</p>
                  <p className="font-semibold text-sm mt-0.5 capitalize">{pet.size.replace('_', ' ')}</p>
                </div>
              )}
              {pet.weight && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Weight</p>
                  <p className="font-semibold text-sm mt-0.5">{pet.weight} kg</p>
                </div>
              )}
              {(pet.city || pet.state) && (
                <div className={`bg-muted/50 rounded-xl p-3 ${!pet.size && !pet.weight ? '' : 'col-span-2'}`}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Location</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {[pet.city, pet.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {isOwner ? (
                <Button className="w-full" disabled>Your Listing</Button>
              ) : pet.adoptionStatus !== 'available' ? (
                <Button className="w-full" disabled>Not Available</Button>
              ) : user?.role === 'adopter' ? (
                <>
                  <Button className="w-full" onClick={handleOpenRequestDialog}>
                    Send Adoption Request
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleOpenVisitDialog}>
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Request a Visit
                  </Button>
                </>
              ) : (
                <Button className="w-full" onClick={() => { toast.info('Sign in as an adopter to adopt this pet'); router.push('/login'); }}>
                  Sign in to Adopt
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleFavoriteToggle}>
                  <Heart size={14} className={`mr-1.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 size={14} className="mr-1.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Owner row */}
            {pet.owner && (
              <div className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={pet.owner.profileImage} alt={pet.owner.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {pet.owner.name?.charAt(0).toUpperCase() || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{pet.owner.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{pet.owner.role || 'Owner'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!isOwner && canMessage && (
                      <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => router.push(`/messages/${pet.owner.id}`)}>
                        <Mail size={13} className="mr-1" /> Message
                      </Button>
                    )}
                    {pet.owner.role === 'shelter' && !isOwner && (
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => router.push(`/shelters/${pet.owner.id}`)}>
                        View Shelter
                      </Button>
                    )}
                  </div>
                </div>
                {!isOwner && !canMessage && user?.role === 'adopter' && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Lock size={10} />
                    Messaging unlocks after your adoption request is approved
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Details below ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* About */}
          {(pet.description || pet.story) && (
            <Card className="md:col-span-2">
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold">About {pet.name}</h2>
                {pet.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{pet.description}</p>
                )}
                {pet.story && (
                  <>
                    <h3 className="font-medium text-sm pt-1">Story</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{pet.story}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Health */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold">Health</h2>
              <div className="space-y-2">
                <HealthRow label="Vaccinated" value={pet.isVaccinated} />
                <HealthRow label="Neutered / Spayed" value={pet.isNeutered || pet.isSpayed} />
                <HealthRow label="House Trained" value={pet.houseTrained} />
              </div>
              {pet.medicalHistory && (
                <div className="pt-1 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Medical History</p>
                  <p className="text-sm text-foreground">{pet.medicalHistory}</p>
                </div>
              )}
              {pet.specialNeeds && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Special Needs</p>
                  <p className="text-sm text-foreground">{pet.specialNeeds}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold">Behavior</h2>
              <div className="space-y-2">
                {pet.goodWithKids  !== null && <HealthRow label="Good with Kids"       value={pet.goodWithKids}  />}
                {pet.goodWithDogs  !== null && <HealthRow label="Good with Dogs"       value={pet.goodWithDogs}  />}
                {pet.goodWithCats  !== null && <HealthRow label="Good with Cats"       value={pet.goodWithCats}  />}
                {pet.goodWithPets  !== null && <HealthRow label="Good with Other Pets" value={pet.goodWithPets}  />}
              </div>
              {(pet.energyLevel || pet.trainedLevel) && (
                <div className="flex gap-4 pt-1 border-t border-border">
                  {pet.energyLevel && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Energy</p>
                      <Badge variant="secondary" className="capitalize">{pet.energyLevel}</Badge>
                    </div>
                  )}
                  {pet.trainedLevel && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Training</p>
                      <Badge variant="secondary" className="capitalize">{pet.trainedLevel.replace('_', ' ')}</Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent notice */}
          {pet.isUrgent && pet.urgentReason && (
            <Card className="md:col-span-2 border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-destructive mb-1">Urgent Adoption</h4>
                  <p className="text-sm text-muted-foreground">{pet.urgentReason}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6">
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
            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Explain why you'd be a good fit — your experience with pets, living situation, etc."
              rows={6}
              maxLength={1000}
              className={requestMessage.length > 0 && requestMessage.length < 20 ? 'border-destructive' : ''}
            />
            <p className={`text-xs ${requestMessage.length < 20 && requestMessage.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {requestMessage.length}/1000 characters
              {requestMessage.length < 20 && requestMessage.length > 0 && ' (minimum 20 required)'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRequestDialog(false); setRequestMessage(''); }} disabled={isRequesting}>
              Cancel
            </Button>
            <Button onClick={handleAdoptionRequest} disabled={isRequesting || requestMessage.length < 20}>
              {isRequesting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Send Request'}
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
            {/* Step 1 — time slot */}
            <div>
              <p className="text-sm font-semibold mb-2">1. Choose a time slot</p>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading availability…
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  This shelter has not set up visit times yet.<br />
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

            {/* Step 2 — date */}
            {selectedSlot && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  2. Choose a date <span className="font-normal text-muted-foreground">(upcoming {DAY_NAMES[selectedSlot.dayOfWeek]}s)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {upcomingDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
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

            {/* Summary */}
            {selectedSlot && selectedDate && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Visit details
                </p>
                <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d yyyy')}</p>
                <p className="text-muted-foreground">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold mb-2">3. Notes <span className="font-normal text-muted-foreground">(optional)</span></p>
              <Textarea
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Any questions, accessibility needs, or who will be attending…"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitDialog(false)} disabled={isBooking}>
              Cancel
            </Button>
            <Button onClick={handleBookVisit} disabled={isBooking || !selectedSlot || !selectedDate}>
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
