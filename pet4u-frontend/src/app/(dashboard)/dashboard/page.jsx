'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  PawPrint, ArrowRight, Plus, ClipboardList, Calendar,
  MessageSquare, Sparkles, Heart, Search, BarChart2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { petAPI } from '@/lib/api/pets';
import PetCard from '../../_component/pets/PetCard';

const ADOPTER_ACTIONS = [
  {
    href: '/my-requests',
    label: 'My Requests',
    desc: 'Track adoption applications',
    Icon: ClipboardList,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    href: '/appointments',
    label: 'Visits',
    desc: 'Scheduled meet & greets',
    Icon: Calendar,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    href: '/messages',
    label: 'Messages',
    desc: 'Chat with shelters',
    Icon: MessageSquare,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    href: '/find-match',
    label: 'Find Match',
    desc: 'Pets picked for you',
    Icon: Sparkles,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    href: '/favorites',
    label: 'Favorites',
    desc: 'Pets you saved',
    Icon: Heart,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950',
  },
  {
    href: '/lost-found',
    label: 'Lost & Found',
    desc: 'Report or find lost pets',
    Icon: Search,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
];

const SHELTER_ACTIONS = [
  {
    href: '/adoption-requests',
    label: 'Requests',
    desc: 'Review adoption requests',
    Icon: ClipboardList,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    href: '/pets/create',
    label: 'Add Pet',
    desc: 'List a new pet',
    Icon: Plus,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    href: '/appointments',
    label: 'Appointments',
    desc: 'Manage scheduled visits',
    Icon: Calendar,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    desc: 'Performance insights',
    Icon: BarChart2,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    href: '/messages',
    label: 'Messages',
    desc: 'Talk to adopters',
    Icon: MessageSquare,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950',
  },
  {
    href: '/my-pets',
    label: 'My Pets',
    desc: 'Manage your listings',
    Icon: PawPrint,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
];

function QuickActionCard({ href, label, desc, Icon, iconColor, iconBg }) {
  return (
    <Link href={href} className="group">
      <div className="bg-card border border-border rounded-2xl p-3.5 h-full hover:border-primary/40 hover:shadow-md transition-all duration-200">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">{desc}</p>
        <div className="mt-2 flex items-center gap-0.5 text-xs text-muted-foreground/60 group-hover:text-primary transition-colors duration-200">
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

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

  const quickActions = user?.role === 'shelter' ? SHELTER_ACTIONS : ADOPTER_ACTIONS;

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

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>
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
