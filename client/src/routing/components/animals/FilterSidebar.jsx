import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export function FilterSidebar() {
  return (
    <div className="w-full md:w-72 bg-white rounded-2xl shadow-lg p-6 space-y-6 h-fit">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <SlidersHorizontal className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Animal Type</h4>
        {['Dog', 'Cat', 'Bird', 'Rabbit'].map((type) => (
          <label key={type} className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
            />
            <span className="text-gray-700">{type}</span>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Age</h4>
        {['Puppy/Kitten', 'Young', 'Adult', 'Senior'].map((age) => (
          <label key={age} className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
            />
            <span className="text-gray-700">{age}</span>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Size</h4>
        {['Small', 'Medium', 'Large'].map((size) => (
          <label key={size} className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
            />
            <span className="text-gray-700">{size}</span>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Traits</h4>
        {['Friendly', 'Good with kids', 'Trained', 'Special needs'].map((trait) => (
          <label key={trait} className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
            />
            <span className="text-gray-700">{trait}</span>
          </label>
        ))}
      </div>

      <button className="w-full bg-pink-500 text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition">
        Apply Filters
      </button>
    </div>
  );
}