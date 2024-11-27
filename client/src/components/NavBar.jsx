import React, { useState } from 'react';
import { PawPrint, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-10 border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text">
              Pet4U
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-pink-500 font-bold transition">Home</a>
            <a href="#" className="text-gray-600 hover:text-pink-500 font-bold transition">Browse Pets</a>
            <a href="#" className="text-gray-600 hover:text-pink-500 font-bold transition">How It Works</a>
            <a href="#" className="text-gray-600 hover:text-pink-500 font-bold transition">About Us</a>
            <button className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-600  hover:px-2 py-2 hover:text-pink-600 font-bold">Home</a>
              <a href="#" className="text-gray-600 hover:px-2 py-2 hover:text-pink-500 font-bold transition">Browse Pets</a>
              <a href="#" className="text-gray-600 hover:px-2 py-2 hover:text-pink-500 font-bold transition">How It Works</a>
              <a href="#" className="text-gray-600 hover:px-2 py-2 hover:text-pink-500 font-bold transition">About Us</a>
              <button className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}