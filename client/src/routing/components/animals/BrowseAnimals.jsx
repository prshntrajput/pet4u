import React, { useState } from 'react';
import { FilterSidebar} from "./FilterSidebar"
import { AnimalGrid } from './AnimalGrid';
import { SlidersHorizontal, X } from 'lucide-react';

export function BrowseAnimals() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-py-8 ">
        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 bg-white px-4 mb-4 py-2 rounded-xl shadow-sm border border-gray-200"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Filters</span>
          </button>
          <select className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option>Sort by: Featured</option>
            <option>Newest first</option>
            <option>Best match</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar for mobile */}
          <div className={`
            fixed inset-0 bg-gray-800/ backdrop-blur-sm z-50 md:hidden transition-opacity duration-300
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}>
            <div className={`
              fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl p-6 overflow-y-auto
              transform transition-transform duration-300
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <FilterSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>

          {/* Sidebar for desktop */}
          <div className="hidden md:block w-72">
            <div className="sticky top-24">
              <FilterSidebar/>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="hidden md:flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Available Pets</h1>
              <div className="flex items-center gap-4">
                <select className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option>Sort by: Featured</option>
                  <option>Newest first</option>
                  <option>Best match</option>
                </select>
              </div>
            </div>
            <AnimalGrid />
          </div>
        </div>
      </div>
    </div>
  );
}