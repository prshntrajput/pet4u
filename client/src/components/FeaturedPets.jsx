import React from 'react';
import { Heart, Star } from 'lucide-react';

const featuredPets = [
  {
    id: 1,
    name: 'Luna',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    matchScore: 98,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 2,
    name: 'Oliver',
    type: 'Cat',
    breed: 'British Shorthair',
    age: '1 year',
    matchScore: 95,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=500',
  },
  {
    id: 3,
    name: 'Max',
    type: 'Dog',
    breed: 'Beagle',
    age: '3 years',
    matchScore: 92,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=500',
  },
];

export function FeaturedPets() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Matches</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI has selected these pets based on current adoption trends and success rates.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
              <div className="relative">
                <img src={pet.image} alt={pet.name} className="w-full h-64 object-cover group-hover:scale-105 transition duration-300" />
               
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">{pet.name}</h3>
                  <span className="text-pink-500 text-sm font-medium">{pet.type}</span>
                </div>
                <p className="text-gray-600 mb-1">{pet.breed}</p>
                <p className="text-gray-500 mb-4">{pet.age}</p>
                <button className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  Meet {pet.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}