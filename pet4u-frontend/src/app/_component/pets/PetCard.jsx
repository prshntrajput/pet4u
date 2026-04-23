'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '@/lib/store/slices/favoriteSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, IndianRupee, AlertCircle } from 'lucide-react';
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
    if (!pet.age) return '?';
    const unit = pet.ageUnit === 'years' ? 'yr' : 'mo';
    return `${pet.age} ${unit}`;
  };

  const getSpeciesIcon = () => {
    const icons = { dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐰', hamster: '🐹', other: '🐾' };
    return icons[pet.species] || '🐾';
  };

  const statusColor = {
    available: 'bg-emerald-100 text-emerald-600',
    pending:   'bg-amber-100 text-amber-600',
    adopted:   'bg-gray-100 text-gray-500',
  };

  return (
    <Link href={`/pets/${pet.slug || pet.id}`}>
      <div className="group cursor-pointer h-full">
        <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col">

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-blue-50 flex-shrink-0">
            {pet.primaryImage ? (
              <Image
                src={pet.primaryImage}
                alt={pet.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl">
                {getSpeciesIcon()}
              </div>
            )}

            {/* Gradient overlay at bottom of image */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Heart button */}
            {showFavoriteButton && (
              <button
                onClick={handleFavoriteToggle}
                disabled={isProcessing}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10 disabled:opacity-60"
              >
                <Heart
                  size={16}
                  className={`transition-colors ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  } ${isProcessing ? 'animate-pulse' : ''}`}
                />
              </button>
            )}

            {/* Status badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {pet.isUrgent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-bold text-white shadow">
                  <AlertCircle size={9} />
                  Urgent
                </span>
              )}
              {pet.adoptionStatus !== 'available' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize shadow ${statusColor[pet.adoptionStatus] || 'bg-white/90 text-gray-600'}`}>
                  {pet.adoptionStatus}
                </span>
              )}
            </div>

            {/* Species emoji bottom-left over gradient */}
            <span className="absolute bottom-2 left-3 text-xl drop-shadow z-10">
              {getSpeciesIcon()}
            </span>
          </div>

          {/* Card body */}
          <div className="p-3.5 flex flex-col gap-2 flex-1">
            {/* Name + breed */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">
                {pet.name}
              </h3>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {pet.breed || (pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1))}
              </p>
            </div>

            {/* Colored info chips */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-600 capitalize">
                {pet.gender || 'Unknown'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-600">
                {getAgeDisplay()}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate max-w-[90px]">{pet.city}</span>
              </div>
              <div className="font-bold text-xs">
                {pet.adoptionFee > 0 ? (
                  <span className="flex items-center text-primary">
                    <IndianRupee size={11} />
                    {pet.adoptionFee}
                  </span>
                ) : (
                  <span className="text-emerald-500">Free</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
