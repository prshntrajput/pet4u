'use client';

import PetCard from './PetCard';
import { Loader2 } from 'lucide-react';

export default function PetGrid({ pets, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          No Pets Found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
