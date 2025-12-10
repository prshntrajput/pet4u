'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../../../lib/store/slices/favoriteSlice';
import PetCard from '../../_component/pets/PetCard';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ShoppingBag, Sparkles } from 'lucide-react';
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-destructive mb-6">{error}</p>
        <Button onClick={() => dispatch(fetchFavorites())}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              My Favorites
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            {pagination.totalCount} {pagination.totalCount === 1 ? 'pet' : 'pets'} saved
          </p>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          {/* Empty State Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Heart className="h-24 w-24 text-primary/20" />
              </div>
              <Heart className="h-24 w-24 text-muted-foreground relative" />
            </div>
          </div>
          
          {/* Empty State Text */}
          <h3 className="text-2xl font-bold mb-2">
            No favorites yet
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start adding pets to your favorites to see them here. Click the heart icon on any pet card!
          </p>
          
          {/* CTA Button */}
          <Link href="/pets">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Pets
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Success Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {pagination.totalCount} {pagination.totalCount === 1 ? 'pet' : 'pets'} in your collection
            </span>
          </div>

          {/* Pet Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((pet) => (
              <PetCard key={pet.id} pet={pet} showFavoriteButton={true} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
