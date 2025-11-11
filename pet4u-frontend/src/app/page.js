'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Heart, Users, CheckCircle, Search, ArrowRight } from 'lucide-react';
import PetCard from '@/app/_component/pets/PetCard';
import { petAPI } from '@/lib/api/pets';

export default function HomePage() {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPets();
  }, []);

  const loadFeaturedPets = async () => {
    try {
      const response = await petAPI.getAllPets({ limit: 8, sortBy: 'createdAt', order: 'desc' });
      if (response.success) {
        setFeaturedPets(response.data.data.pets);
      }
    } catch (error) {
      console.error('Failed to load featured pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <PawPrint className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Pet Companion
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with trusted shelters and find your new best friend. 
            Adopt, dont shop!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/pets">
              <Button size="lg" variant="outline" className="text-lg bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                <Search className="mr-2 h-5 w-5" />
                Browse Pets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Available Pets</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">45</div>
              <div className="text-gray-600">Active Shelters</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">230</div>
              <div className="text-gray-600">Happy Adoptions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Pets</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet some of our adorable pets waiting for their forever homes
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredPets.slice(0, 8).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>

              <div className="text-center">
                <Link href="/pets">
                  <Button size="lg">
                    View All Pets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PET4U?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
                <p className="text-gray-600">
                  Browse hundreds of pets and find the perfect companion that matches your lifestyle and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted Shelters</h3>
                <p className="text-gray-600">
                  Connect with verified shelters and organizations dedicated to animal welfare and responsible adoption.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Simple Process</h3>
                <p className="text-gray-600">
                  Easy adoption requests, real-time communication, and streamlined process from inquiry to adoption.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up as an adopter or shelter in minutes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Pets</h3>
              <p className="text-gray-600">Search and filter pets by location, species, and more</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Send adoption requests and communicate with shelters</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Adopt</h3>
              <p className="text-gray-600">Complete the adoption and welcome your new friend</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Pet?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of happy pet owners who found their companions through PET4U
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/pets">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                Browse Available Pets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
