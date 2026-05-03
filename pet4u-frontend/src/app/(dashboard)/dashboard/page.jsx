'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  PawPrint, Heart, FileText, TrendingUp, MessageSquare,
  ArrowRight, Sparkles, Plus, Calendar, Inbox,
} from 'lucide-react';
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

  const shelterActions = [
    { href: '/pets/create',       icon: Plus,          label: 'Add Pet',      primary: true },
    { href: '/my-pets',           icon: PawPrint,      label: 'My Pets'      },
    { href: '/adoption-requests', icon: Inbox,         label: 'Requests'     },
    { href: '/appointments',      icon: Calendar,      label: 'Appointments' },
    { href: '/analytics',         icon: TrendingUp,    label: 'Analytics'    },
    { href: '/messages',          icon: MessageSquare, label: 'Messages'     },
  ];

  const adopterActions = [
    { href: '/pets',         icon: PawPrint,      label: 'Browse',     primary: true },
    { href: '/match',        icon: Sparkles,      label: 'Find Match' },
    { href: '/favorites',    icon: Heart,         label: 'Favorites'  },
    { href: '/my-requests',  icon: FileText,      label: 'Requests'   },
    { href: '/appointments', icon: Calendar,      label: 'Visits'     },
    { href: '/messages',     icon: MessageSquare, label: 'Messages'   },
  ];

  const quickActions = user?.role === 'shelter' ? shelterActions : adopterActions;

  return (
    <div className="space-y-6">

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

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link key={i} href={a.href}>
              <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all hover:shadow-sm cursor-pointer ${
                a.primary
                  ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/15'
                  : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50'
              }`}>
                <Icon className={`h-5 w-5 ${a.primary ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[11px] font-medium leading-tight ${a.primary ? 'text-primary' : 'text-foreground/80'}`}>
                  {a.label}
                </span>
              </div>
            </Link>
          );
        })}
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
