'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Heart, Users, CheckCircle, Search, ArrowRight, Sparkles } from 'lucide-react';
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
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by 1000+ families</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary-foreground bg-clip-text text-transparent">
                Find Your Perfect Pet Companion
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with trusted shelters and find your new best friend. 
              Adopt, dont shop!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pets">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base border-2">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Pets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '150+', label: 'Available Pets' },
              { value: '45', label: 'Active Shelters' },
              { value: '230', label: 'Happy Adoptions' },
              { value: '1000+', label: 'Community Members' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="text-3xl md:text-4xl font-bold mb-1 text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
              <PawPrint className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Featured Pets</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Your New Best Friend
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Adorable pets waiting for their forever homes
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                {featuredPets.slice(0, 8).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>

              <div className="text-center">
                <Link href="/pets">
                  <Button size="lg" variant="outline" className="border-2">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Pet4u?
            </h2>
            <p className="text-muted-foreground">
              Everything you need for a successful adoption
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Heart,
                title: 'Find Your Match',
                description: 'Browse hundreds of pets and find the perfect companion that matches your lifestyle.',
              },
              {
                icon: Users,
                title: 'Trusted Shelters',
                description: 'Connect with verified shelters dedicated to animal welfare and responsible adoption.',
              },
              {
                icon: CheckCircle,
                title: 'Simple Process',
                description: 'Easy adoption requests and streamlined process from inquiry to adoption.',
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Four simple steps to find your perfect pet
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '1', title: 'Create Account', description: 'Sign up in minutes' },
              { step: '2', title: 'Browse Pets', description: 'Search by location & species' },
              { step: '3', title: 'Connect', description: 'Send adoption requests' },
              { step: '4', title: 'Adopt', description: 'Welcome your new friend' }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              Ready to Find Your Perfect Pet?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Join thousands of happy pet owners who found their companions through Pet4u
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-12 shadow-xl">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pets">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Browse Available Pets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
