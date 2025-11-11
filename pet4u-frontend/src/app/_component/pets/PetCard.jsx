'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '@/lib/store/slices/favoriteSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PetCard({ pet, showFavoriteButton = true }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favoritedPetIds, isAdding, isRemoving } = useSelector((state) => state.favorites);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsFavorited(favoritedPetIds.includes(pet.id));
  }, [favoritedPetIds, pet.id]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    setIsProcessing(true);

    try {
      if (isFavorited) {
        await dispatch(removeFavorite(pet.id)).unwrap();
        toast.success('Removed from favorites');
      } else {
        await dispatch(addFavorite(pet.id)).unwrap();
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error(error || 'Failed to update favorites');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAgeDisplay = () => {
    if (!pet.age) return 'Age unknown';
    const unit = pet.ageUnit === 'years' ? 'year' : 'month';
    return `${pet.age} ${unit}${pet.age > 1 ? 's' : ''} old`;
  };

  const getSpeciesIcon = () => {
    const icons = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      rabbit: '🐰',
      hamster: '🐹',
      other: '🐾'
    };
    return icons[pet.species] || '🐾';
  };

  return (
    <Link href={`/pets/${pet.slug || pet.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {pet.primaryImage ? (
            <Image
              src={pet.primaryImage}
              alt={pet.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              {getSpeciesIcon()}
            </div>
          )}
          
          {/* Favorite Button */}
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isProcessing}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 disabled:opacity-50"
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  isFavorited 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600'
                } ${isProcessing ? 'animate-pulse' : ''}`}
              />
            </button>
          )}

          {/* Urgent Badge */}
          {pet.isUrgent && (
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>Urgent</span>
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-2 right-2 z-10">
            <Badge
              variant={
                pet.adoptionStatus === 'available' ? 'success' :
                pet.adoptionStatus === 'pending' ? 'secondary' :
                'default'
              }
            >
              {pet.adoptionStatus}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-2">
          {/* Name and Species */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {pet.name}
              </h3>
              <p className="text-sm text-gray-600">
                {pet.breed || pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              </p>
            </div>
            <span className="text-2xl ml-2">{getSpeciesIcon()}</span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={14} className="mr-1" />
              <span>{getAgeDisplay()}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{pet.gender}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-1" />
              <span className="truncate">
                {pet.city}, {pet.state}
              </span>
            </div>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-700 line-clamp-2">
            {pet.description}
          </p>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            {pet.adoptionFee > 0 ? `₹${pet.adoptionFee}` : 'Free'}
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
