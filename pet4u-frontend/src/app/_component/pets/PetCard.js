'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '@/lib/store/slices/favoriteSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, AlertCircle, PawPrint } from 'lucide-react';
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
    if (!isAuthenticated) { toast.error('Please login to save favorites'); return; }
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
    if (!pet.age) return null;
    const unit = pet.ageUnit === 'years' ? 'yr' : 'mo';
    return `${pet.age}${unit}`;
  };

  const age = getAgeDisplay();

  return (
    <Link href={`/pets/${pet.slug || pet.id}`} className="block h-full">
      <div className="group h-full bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
          {pet.primaryImage ? (
            <Image
              src={pet.primaryImage}
              alt={pet.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PawPrint className="h-10 w-10 text-muted-foreground/25" />
            </div>
          )}

          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isProcessing}
              className="absolute top-2 right-2 p-1.5 bg-background/85 backdrop-blur-sm rounded-full shadow hover:scale-110 active:scale-95 transition-all z-10 disabled:opacity-60"
            >
              <Heart
                size={13}
                className={`transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} ${isProcessing ? 'animate-pulse' : ''}`}
              />
            </button>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {pet.isUrgent && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive rounded-md text-[10px] font-semibold text-destructive-foreground">
                <AlertCircle size={9} />
                Urgent
              </span>
            )}
            {pet.adoptionStatus !== 'available' && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize bg-background/85 backdrop-blur-sm text-foreground">
                {pet.adoptionStatus}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight truncate">{pet.name}</h3>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {pet.breed || (pet.species ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1) : 'Pet')}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {pet.gender && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                {pet.gender}
              </span>
            )}
            {age && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                {age}
              </span>
            )}
          </div>

          {pet.city && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-auto pt-1.5 border-t border-border">
              <MapPin size={10} className="flex-shrink-0" />
              <span className="truncate">{pet.city}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
