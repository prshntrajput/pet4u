'use client';

import PetCard from './PetCard';
import { Loader2 } from 'lucide-react';

export default function PetGrid({ pets, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
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
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-xl font-semibold mb-2">
          No Pets Found
        </h3>
        <p className="text-muted-foreground text-sm">
          Try adjusting your filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
