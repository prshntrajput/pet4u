import React from 'react';
import { Heart, Star } from 'lucide-react';

export function AnimalCard({ animal }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={animal.image} 
          alt={animal.name}
          className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">{animal.matchScore}% Match</span>
        </div>
        {animal.featured && (
          <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-semibold">{animal.name}</h3>
          <span className="text-pink-500 text-sm font-medium">{animal.type}</span>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600">{animal.breed}</p>
          <p className="text-gray-500">{animal.age}</p>
          <div className="flex flex-wrap gap-2">
            {animal.traits.map((trait, index) => (
              <span 
                key={index}
                className="bg-pink-50 text-pink-600 px-2 py-1 rounded-full text-xs font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full bg-pink-500 text-white py-2 sm:py-3 rounded-xl font-semibold hover:bg-pink-600 transition flex items-center justify-center gap-2">
          <Heart className="h-5 w-5" />
          Meet {animal.name}
        </button>
      </div>
    </div>
  );
}