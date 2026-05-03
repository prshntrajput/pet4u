'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Shield, Calendar, Sparkles } from 'lucide-react';
import PetCard from '@/app/_component/pets/PetCard';
import { petAPI } from '@/lib/api/pets';

export default function HomePage() {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    petAPI
      .getAllPets({ limit: 8, sortBy: 'createdAt', order: 'desc' })
      .then((r) => r.success && setFeaturedPets(r.data.data.pets))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ─── Navbar ─── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Pet4u</span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pets" className="hover:text-foreground transition-colors">Browse pets</Link>
            <Link href="/lost-found" className="hover:text-foreground transition-colors">Lost &amp; Found</Link>
            <Link href="/match" className="hover:text-foreground transition-colors">Find match</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm h-8 px-4">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-36 pb-24">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/6 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3 w-3" />
            Smart pet adoption for India
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[4.5rem] font-bold leading-[1.06] tracking-tighter">
            Find a pet that<br />
            <span className="text-primary">fits your life</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Browse verified shelters, use our matching quiz, and adopt with full confidence — from first browse to welcome home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link href="/register">
              <Button size="lg" className="h-11 px-7 text-sm font-semibold">
                Start adopting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pets">
              <Button size="lg" variant="outline" className="h-11 px-7 text-sm">
                <Search className="mr-2 h-4 w-4" />
                Browse pets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
    {/**   <section className="border-y border-border bg-muted/40">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-3 max-w-xl mx-auto divide-x divide-border">
            {[
              { value: '150+', label: 'Pets available' },
              { value: '45',   label: 'Verified shelters' },
              { value: '230+', label: 'Adoptions completed' },
            ].map((s, i) => (
              <div key={i} className="text-center px-6 first:pl-0 last:pr-0">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> **/}

      {/* ─── Featured Pets ─── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Newly listed</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recently added pets</h2>
            </div>
            <Link href="/pets" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-sm gap-1.5">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-muted aspect-[3/4] animate-pulse"
                />
              ))}
            </div>
          ) : featuredPets.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredPets.slice(0, 8).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
              <div className="sm:hidden mt-8 text-center">
                <Link href="/pets">
                  <Button variant="outline" className="gap-2">
                    View all pets <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No pets listed yet. Be the first shelter to add one.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why Pet4u</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built for confident adoption</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Everything you need to find, connect, and adopt — no back-and-forth, no confusion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: 'Smart matching quiz',
                desc: 'Answer a few questions about your home and lifestyle. We score every available pet and surface the best fits for you.',
              },
              {
                icon: Shield,
                title: 'Verified shelters only',
                desc: 'Every shelter on Pet4u is reviewed before going live. You see listings from organisations with a genuine commitment to animal welfare.',
              },
              {
                icon: Calendar,
                title: 'Appointments built in',
                desc: 'Request meet-and-greet sessions directly from a pet\'s page. Shelters confirm, you get a reminder — no phone tag.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4.5 w-4.5 text-primary" style={{ width: '18px', height: '18px' }} />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How adoption works</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {[
              {
                n: '01',
                title: 'Create a free account',
                desc: 'Sign up as an adopter in under a minute. No fees, ever.',
              },
              {
                n: '02',
                title: 'Browse or take the quiz',
                desc: 'Filter by species, city, size — or let our matching quiz rank pets by how well they suit your home.',
              },
              {
                n: '03',
                title: 'Connect with the shelter',
                desc: 'Message the shelter directly and book a meet-and-greet from the pet\'s page.',
              },
              {
                n: '04',
                title: 'Bring your pet home',
                desc: 'Submit your adoption application, get approved, and welcome your new companion.',
              },
            ].map((s, i, arr) => (
              <div key={i} className="flex gap-5 group">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-colors bg-card">
                    <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {s.n}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 bg-border my-2 min-h-[2rem]" />
                  )}
                </div>
                <div className="pb-8 pt-1.5">
                  <h3 className="font-semibold text-sm text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Lost & Found banner ─── */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-semibold text-foreground">Lost or found a pet?</h3>
              <p className="text-sm text-muted-foreground">
                Report a lost animal or help reunite a found pet with its family. Free and open to everyone.
              </p>
            </div>
            <Link href="/lost-found" className="shrink-0">
              <Button variant="outline" className="gap-2">
                View reports <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-foreground">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-background tracking-tight mb-4 leading-tight">
            A pet is waiting for you right now
          </h2>
          <p className="text-background/55 text-sm sm:text-base mb-9 leading-relaxed">
            Thousands of animals in shelters are hoping for a second chance.
            Yours could be among them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="h-11 px-7 text-sm font-semibold bg-background text-foreground hover:bg-background/92"
              >
                Find my pet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pets">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-7 text-sm border-background/25 text-background hover:bg-background/10 hover:text-background"
              >
                Browse listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold text-foreground">Pet4u</span>
          <p className="text-xs text-muted-foreground order-last sm:order-none">
            © 2025 Pet4u. Making pet adoption simple.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/login"    className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/pets"     className="hover:text-foreground transition-colors">Browse</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
