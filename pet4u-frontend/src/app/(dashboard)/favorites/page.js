'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../../../lib/store/slices/favoriteSlice';
import PetCard from '../../_component/pets/PetCard';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const { favorites, isLoading, error, pagination } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites({ page: 1, limit: 12 }));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchFavorites())}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="mr-3 h-8 w-8 text-red-600 fill-red-600" />
            My Favorites
          </h1>
          <p className="text-gray-600 mt-2">
            {pagination.totalCount} {pagination.totalCount === 1 ? 'pet' : 'pets'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <Heart className="h-24 w-24 text-gray-300" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding pets to your favorites to see them here
          </p>
          <Link href="/pets">
            <Button size="lg">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Pets
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((pet) => (
            <PetCard key={pet.id} pet={pet} showFavoriteButton={true} />
          ))}
        </div>
      )}
    </div>
  );
}
