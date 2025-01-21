import React from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-white to-white"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-pink-50 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-pink-500 mr-2" />
            <span className="text-sm text-pink-600 font-medium">PET4U</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text"> Furry </span>
            Companion
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Explore a wide range of adorable pets waiting for a loving home. Start your journey to find the perfect companion today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25">
              <Heart className="h-5 w-5" />
              Adopt
              <ArrowRight className="h-5 w-5" />
            </button>
           <Link to={"/home"}> <button className="bg-white text-pink-500 px-8 py-4 rounded-full font-semibold border-2 border-pink-500 hover:bg-pink-50 transition">
              Browse All Pets
            </button> </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
