'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PawPrint, Search, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center py-20 overflow-hidden">
        {/* Sky-blue ambient blobs */}
        <div className="absolute -top-24 -left-44 w-[560px] h-[560px] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-44 w-[460px] h-[460px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/6 blur-3xl" />
        {/* Cloud-like decorative circles (like the image) */}
        <div className="absolute top-16 right-24 w-24 h-24 rounded-full bg-white/60 blur-xl" />
        <div className="absolute top-32 right-48 w-14 h-14 rounded-full bg-white/50 blur-lg" />
        <div className="absolute bottom-20 left-20 w-20 h-20 rounded-full bg-white/40 blur-xl" />

        {/* Paw prints */}
        <span className="absolute top-12 right-16 text-5xl text-primary/20 rotate-12 select-none pointer-events-none">🐾</span>
        <span className="absolute bottom-16 left-12 text-4xl text-primary/15 -rotate-12 select-none pointer-events-none">🐾</span>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-md border border-primary/20 mb-8">
              <PawPrint className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Every pet deserves a loving home</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.02] tracking-tighter">
              <span className="text-foreground">Find Your </span>
              <span className="text-foreground">Dream</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                  Pet Here
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-50" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Connect with trusted shelters. Give a pet the forever home they deserve.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/35 hover:shadow-xl hover:shadow-primary/45 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pets">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-10 h-14 text-base border-2 rounded-2xl bg-white/80 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Pets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { value: '150+', label: 'Pets Available', emoji: '🐶', bg: 'bg-blue-50', text: 'text-primary' },
              { value: '45',   label: 'Verified Shelters', emoji: '🏠', bg: 'bg-pink-50', text: 'text-pink-500' },
              { value: '230+', label: 'Happy Adoptions', emoji: '❤️', bg: 'bg-teal-50', text: 'text-teal-500' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-3xl p-5 text-center group cursor-default hover:shadow-md transition-all duration-200`}>
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{stat.emoji}</div>
                <div className={`text-3xl md:text-4xl font-bold mb-1 ${stat.text}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Pets ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Newly Listed</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Meet Your New{' '}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Best Friend
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Adorable pets waiting for their forever homes
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <PawPrint className="absolute inset-0 m-auto h-6 w-6 text-primary/50" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
                {featuredPets.slice(0, 8).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
              <div className="text-center">
                <Link href="/pets">
                  <Button size="lg" variant="outline" className="border-2 px-8 h-12 hover:-translate-y-0.5 transition-all duration-200">
                    View All Pets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Why Pet4u ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Why{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Pet4u?
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for a successful adoption
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                emoji: '💝',
                title: 'Find Your Match',
                description: 'Browse pets by species, size, and personality — until one just feels right.',
                bg: 'bg-pink-50',
                iconBg: 'bg-pink-100',
              },
              {
                emoji: '🛡️',
                title: 'Trusted Shelters',
                description: 'Every shelter on Pet4u is verified — dedicated to animal welfare and ethical adoption.',
                bg: 'bg-blue-50',
                iconBg: 'bg-blue-100',
              },
              {
                emoji: '⚡',
                title: 'Simple Process',
                description: 'From first browse to welcome home — the whole process is streamlined and stress-free.',
                bg: 'bg-teal-50',
                iconBg: 'bg-teal-100',
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`${f.bg} rounded-3xl p-8 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${f.iconBg} text-4xl mb-5`}>
                  {f.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to your new best friend</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { emoji: '✍️', title: 'Create Account',  description: 'Sign up in minutes — free forever' },
              { emoji: '🔍', title: 'Browse Pets',     description: 'Filter by species, location & more' },
              { emoji: '💌', title: 'Send Request',    description: 'Connect directly with the shelter' },
              { emoji: '🏡', title: 'Welcome Home',    description: 'Give your new friend a forever home' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 group-hover:border-primary/70 group-hover:bg-primary/18 transition-all duration-300 mb-5 shadow-md">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-primary/50 to-primary/10 -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent-foreground" />
        <div className="absolute inset-0 select-none pointer-events-none overflow-hidden">
          <span className="absolute top-6  left-12  text-6xl opacity-20 rotate-12">🐾</span>
          <span className="absolute bottom-6  right-12 text-5xl opacity-20 -rotate-12">🐾</span>
          <span className="absolute top-1/2 left-1/4  text-3xl opacity-15 rotate-45">🐾</span>
          <span className="absolute top-1/3 right-1/4 text-4xl opacity-15 -rotate-30">🐾</span>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-6">🐶</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-primary-foreground leading-tight tracking-tight">
              A pet is waiting for you right now
            </h2>
            <p className="text-xl mb-10 text-primary-foreground/80 max-w-xl mx-auto leading-relaxed">
              Your future companion is already at a shelter, hoping someone like you comes along.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 h-14 text-base font-semibold bg-white text-primary hover:bg-white/92 shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Find My Pet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pets">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-10 h-14 border-2 border-white/50 text-primary hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                >
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
