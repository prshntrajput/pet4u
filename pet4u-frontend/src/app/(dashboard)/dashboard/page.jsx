'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PawPrint, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { petAPI } from '@/lib/api/pets';
import PetCard from '../../_component/pets/PetCard';

export default function DashboardPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();

  const [featuredPets, setFeaturedPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadPets();
  }, [user]);

  const loadPets = async () => {
    try {
      if (user.role === 'shelter') {
        const res = await petAPI.getMyPets({ limit: 8, page: 1 });
        setFeaturedPets(res.data?.data?.pets || []);
      } else {
        const res = await petAPI.getAllPets({ limit: 8, page: 1, sortBy: 'createdAt', order: 'desc' });
        setFeaturedPets(res.data?.data?.pets || []);
      }
    } catch {
      // non-fatal
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role === 'admin') { router.push('/admin'); return null; }

  return (
    <div className="space-y-5">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.role === 'shelter'
              ? 'Manage your pets and adoption requests'
              : 'Find your perfect companion'}
          </p>
        </div>
        {user?.role === 'shelter' && (
          <Link href="/pets/create">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Pet
            </Button>
          </Link>
        )}
      </div>

      {/* Featured / My Pets */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm">
            {user?.role === 'shelter' ? 'My Pets' : 'Featured Pets'}
          </h2>
          <Link href={user?.role === 'shelter' ? '/my-pets' : '/pets'}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[4/3]" />
              ))}
            </div>
          ) : featuredPets.length === 0 ? (
            <div className="text-center py-14">
              <PawPrint className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {user?.role === 'shelter' ? 'No pets added yet' : 'No pets available'}
              </p>
              {user?.role === 'shelter' && (
                <Link href="/pets/create">
                  <Button size="sm" className="mt-3">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add First Pet
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
