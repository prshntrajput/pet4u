'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPetById, clearCurrentPet } from '@/lib/store/slices/petSlice';
import { createAdoptionRequest } from '@/lib/store/slices/adoptionSlice';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import PetReviewsSection from '@/app/_component/pets/PetReviewsSection';

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentPet, isLoading, error } = useSelector((state) => state.pets);
  const { user } = useSelector((state) => state.auth);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (params.petId) {
      dispatch(fetchPetById(params.petId));
    }

    return () => {
      dispatch(clearCurrentPet());
    };
  }, [params.petId, dispatch]);

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
  const displayImages = images.length > 0 ? images : [{ imageUrl: pet.primaryImage }];

  const getAgeDisplay = () => {
    if (!pet.age) return 'Age unknown';
    const unit = pet.ageUnit === 'years' ? 'year' : 'month';
    return `${pet.age} ${unit}${pet.age > 1 ? 's' : ''} old`;
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    // TODO: Implement favorite API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Meet ${pet.name}`,
        text: pet.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAdoptionRequest = async () => {
    if (!user) {
      toast.error('Please login to send adoption request');
      router.push('/login');
      return;
    }

    if (user.role !== 'adopter') {
      toast.error('Only adopters can send adoption requests');
      return;
    }

    if (!requestMessage.trim() || requestMessage.length < 20) {
      toast.error('Please provide a detailed message (at least 20 characters)');
      return;
    }

    setIsRequesting(true);

    try {
      await dispatch(createAdoptionRequest({
        petId: pet.id,
        message: requestMessage.trim(),
      })).unwrap();

      toast.success('Adoption request sent successfully!');
      setShowRequestDialog(false);
      setRequestMessage('');
    } catch (error) {
      toast.error(error || 'Failed to send adoption request');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenRequestDialog = () => {
    if (!user) {
      toast.error('Please login to send adoption request');
      router.push('/login');
      return;
    }

    if (user.role !== 'adopter') {
      toast.error('Only adopters can send adoption requests');
      return;
    }

    setShowRequestDialog(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {displayImages[selectedImageIndex]?.imageUrl ? (
                  <Image
                    src={displayImages[selectedImageIndex].imageUrl}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-8xl">
                    🐾
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-600 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {image.imageUrl ? (
                      <Image
                        src={image.imageUrl}
                        alt={`${pet.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        🐾
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">About {pet.name}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{pet.description}</p>
                </div>

                {pet.story && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Story</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{pet.story}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Information */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Health Information</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    {pet.isVaccinated ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm">Vaccinated</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {pet.isNeutered || pet.isSpayed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm">Neutered/Spayed</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {pet.houseTrained ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
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

            {/* Behavioral Traits */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Behavioral Traits</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {pet.goodWithKids !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithKids ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">Good with Kids</span>
                    </div>
                  )}

                  {pet.goodWithDogs !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithDogs ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">Good with Dogs</span>
                    </div>
                  )}

                  {pet.goodWithCats !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithCats ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">Good with Cats</span>
                    </div>
                  )}

                  {pet.goodWithPets !== null && (
                    <div className="flex items-center space-x-2">
                      {pet.goodWithPets ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
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
                    <Badge variant="secondary" className="capitalize">
                      {pet.trainedLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Pet Info Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                    {pet.isUrgent && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle size={14} />
                        <span>Urgent</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-600">
                    {pet.breed || pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <Badge
                    variant={
                      pet.adoptionStatus === 'available' ? 'success' :
                      pet.adoptionStatus === 'pending' ? 'secondary' :
                      'default'
                    }
                    className="text-sm"
                  >
                    {pet.adoptionStatus.charAt(0).toUpperCase() + pet.adoptionStatus.slice(1)}
                  </Badge>
                </div>

                {/* Adoption Fee */}
                <div className="py-4 border-y">
                  <div className="text-sm text-gray-600">Adoption Fee</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {pet.adoptionFee > 0 ? `₹${pet.adoptionFee}` : 'Free'}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{getAgeDisplay()}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Ruler className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="capitalize">{pet.gender}</span>
                    {pet.size && <span className="ml-2">• {pet.size.replace('_', ' ')}</span>}
                  </div>

                  {pet.weight && (
                    <div className="flex items-center text-gray-700">
                      <Weight className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{pet.weight} kg</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{pet.city}, {pet.state}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleOpenRequestDialog}
                    disabled={pet.adoptionStatus !== 'available' || pet.ownerId === user?.id}
                  >
                    {pet.ownerId === user?.id ? 'Your Listing' : 'Send Adoption Request'}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleFavoriteToggle}
                    >
                      <Heart
                        size={18}
                        className={`mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleShare}
                    >
                      <Share2 size={18} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info Card */}
            {pet.owner && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pet.owner.role === 'shelter' ? 'Shelter Information' : 'Owner Information'}
                  </h3>

                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pet.owner.profileImage} alt={pet.owner.name} />
                      <AvatarFallback>
                        {pet.owner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{pet.owner.name}</div>
                      <div className="text-sm text-gray-600 capitalize">{pet.owner.role}</div>
                    </div>
                  </div>

                  {pet.owner.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {pet.owner.city}, {pet.owner.state}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <Mail size={16} className="mr-2" />
                      Send Message
                    </Button>
                    {pet.owner.role === 'shelter' && (
                      <Button variant="outline" className="w-full" size="sm">
                        View Shelter Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Urgent Reason */}
            {pet.isUrgent && pet.urgentReason && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
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
         <PetReviewsSection 
          petId={pet.id} 
          canReview={user?.role === 'adopter' && pet.ownerId !== user?.userId}
         />
         </div>

      {/* Adoption Request Dialog */}
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
              placeholder="Explain why you would be a good fit for this pet, your experience with pets, your living situation, etc..."
              rows={6}
              maxLength={1000}
              className={requestMessage.length > 0 && requestMessage.length < 20 ? 'border-red-500' : ''}
            />
            <p className={`text-xs ${
              requestMessage.length < 20 && requestMessage.length > 0
                ? 'text-red-500'
                : 'text-gray-500'
            }`}>
              {requestMessage.length}/1000 characters 
              {requestMessage.length < 20 && requestMessage.length > 0 && ' (minimum 20 required)'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestDialog(false);
                setRequestMessage('');
              }}
              disabled={isRequesting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdoptionRequest}
              disabled={isRequesting || requestMessage.length < 20}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
