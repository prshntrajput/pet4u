'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '@/lib/store/slices/favoriteSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, AlertCircle, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function PetCard({ pet, showFavoriteButton = true }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { favoritedPetIds } = useSelector((state) => state.favorites);
  
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
    if (!pet.age) return 'Unknown';
    const unit = pet.ageUnit === 'years' ? 'yr' : 'mo';
    return `${pet.age}${unit}`;
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
      <Card className="group hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden border-2 h-full">
        {/* Compact Image - 16:10 aspect ratio (even more compact) */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {pet.primaryImage ? (
            <Image
              src={pet.primaryImage}
              alt={pet.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl bg-accent/20">
              {getSpeciesIcon()}
            </div>
          )}
          
          {/* Compact Favorite Button */}
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isProcessing}
              className="absolute top-1.5 right-1.5 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-10 disabled:opacity-50"
            >
              <Heart
                size={14}
                className={`transition-colors ${
                  isFavorited 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-muted-foreground'
                } ${isProcessing ? 'animate-pulse' : ''}`}
              />
            </button>
          )}

          {/* Compact Badges */}
          <div className="absolute top-1.5 left-1.5 flex gap-1 z-10">
            {pet.isUrgent && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 leading-none">
                <AlertCircle size={8} className="mr-0.5" />
                Urgent
              </Badge>
            )}
            <Badge
              variant={
                pet.adoptionStatus === 'available' ? 'success' :
                pet.adoptionStatus === 'pending' ? 'secondary' :
                'default'
              }
              className="text-[9px] px-1 py-0 h-4 leading-none capitalize"
            >
              {pet.adoptionStatus}
            </Badge>
          </div>
        </div>

        {/* Ultra Compact Content */}
        <CardContent className="p-2.5 space-y-1.5">
          {/* Name Row */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {pet.name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">
                {pet.breed || pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1)}
              </p>
            </div>
            <span className="text-lg flex-shrink-0 leading-none">{getSpeciesIcon()}</span>
          </div>

          {/* Compact Details in Single Line */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Clock size={10} />
              <span>{getAgeDisplay()}</span>
            </div>
            <span>•</span>
            <span className="capitalize truncate">{pet.gender}</span>
          </div>

          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{pet.city}, {pet.state}</span>
          </div>

          {/* Price and CTA in one line */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center font-bold text-xs">
              {pet.adoptionFee > 0 ? (
                <div className="flex items-center text-primary">
                  <IndianRupee size={11} />
                  <span>{pet.adoptionFee}</span>
                </div>
              ) : (
                <span className="text-green-600">Free</span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[10px] px-2 hover:bg-primary hover:text-primary-foreground"
            >
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
