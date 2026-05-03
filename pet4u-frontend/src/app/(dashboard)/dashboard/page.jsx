'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  PawPrint, Heart, FileText, TrendingUp, MessageSquare,
  AlertCircle, Clock, CheckCircle, XCircle, ArrowRight, Sparkles, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { petAPI } from '@/lib/api/pets';
import { favoriteAPI } from '@/lib/api/favorites';
import { adoptionRequestAPI } from '@/lib/api/adoptionRequests';
import PetCard from '../../_component/pets/PetCard';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  pending:  { icon: Clock,        bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Pending'  },
  approved: { icon: CheckCircle,  bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
  rejected: { icon: XCircle,      bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected' },
};

function StatusChip({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();

  const [stats, setStats] = useState({ totalPets: 0, myFavorites: 0, myRequests: 0, receivedRequests: 0, pendingRequests: 0 });
  const [recentPets, setRecentPets] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user.role === 'shelter') {
        const [petsRes, requestsRes] = await Promise.all([
          petAPI.getMyPets({ limit: 4, page: 1 }),
          adoptionRequestAPI.getReceivedRequests({ limit: 5 }),
        ]);
        setStats({
          totalPets: petsRes.data?.data?.pagination?.totalCount || 0,
          receivedRequests: requestsRes.data?.data?.pagination?.totalCount || 0,
          pendingRequests: requestsRes.data?.data?.requests?.filter(r => r.status === 'pending').length || 0,
        });
        setRecentPets(petsRes.data?.data?.pets || []);
        setRecentRequests(requestsRes.data?.data?.requests || []);
      } else if (user.role === 'adopter') {
        const [favoritesRes, requestsRes, petsRes] = await Promise.all([
          favoriteAPI.getMyFavorites({ limit: 1 }),
          adoptionRequestAPI.getMyRequests({ limit: 5 }),
          petAPI.getAllPets({ limit: 4, page: 1 }),
        ]);
        setStats({
          myFavorites: favoritesRes.data?.data?.pagination?.totalCount || 0,
          myRequests: requestsRes.data?.data?.pagination?.totalCount || 0,
          pendingRequests: requestsRes.data?.data?.requests?.filter(r => r.status === 'pending').length || 0,
        });
        setRecentPets(petsRes.data?.data?.pets || []);
        setRecentRequests(requestsRes.data?.data?.requests || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role === 'admin') { router.push('/admin'); return null; }

  const shelterStats = [
    { label: 'Total Pets',       value: stats.totalPets,        icon: PawPrint,    href: '/my-pets',           cta: 'Manage pets' },
    { label: 'Pending Requests', value: stats.pendingRequests,  icon: AlertCircle, href: '/adoption-requests', cta: 'Review now'  },
    { label: 'Total Requests',   value: stats.receivedRequests, icon: FileText,    href: '/analytics',         cta: 'Analytics'   },
  ];

  const adopterStats = [
    { label: 'Saved Pets',  value: stats.myFavorites,     icon: Heart,    href: '/favorites',   cta: 'View saved'    },
    { label: 'My Requests', value: stats.myRequests,      icon: FileText, href: '/my-requests', cta: 'Track status'  },
    { label: 'Pending',     value: stats.pendingRequests, icon: Clock,    href: '/my-requests', cta: 'Awaiting reply' },
  ];

  const statCards = user?.role === 'shelter' ? shelterStats : adopterStats;

  const shelterActions = [
    { href: '/pets/create',       icon: Plus,          label: 'Add New Pet'   },
    { href: '/my-pets',           icon: PawPrint,      label: 'Manage Pets'   },
    { href: '/adoption-requests', icon: FileText,      label: 'View Requests' },
    { href: '/analytics',         icon: TrendingUp,    label: 'Analytics'     },
    { href: '/messages',          icon: MessageSquare, label: 'Messages'      },
  ];

  const adopterActions = [
    { href: '/pets',        icon: PawPrint,      label: 'Browse Pets'   },
    { href: '/favorites',   icon: Heart,         label: 'My Favorites'  },
    { href: '/my-requests', icon: FileText,      label: 'My Requests'   },
    { href: '/match',       icon: Sparkles,      label: 'Find My Match' },
    { href: '/messages',    icon: MessageSquare, label: 'Messages'      },
  ];

  const quickActions = user?.role === 'shelter' ? shelterActions : adopterActions;

  return (
    <div className="space-y-6">

      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === 'shelter'
              ? "Here's what's happening with your pets today"
              : 'Discover pets waiting for their forever home'}
          </p>
        </div>
        {user?.role === 'shelter' && (
          <Link href="/pets/create">
            <Button size="sm">
              <PawPrint className="mr-1.5 h-4 w-4" />
              Add New Pet
            </Button>
          </Link>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link key={i} href={s.href}>
              <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-2xl font-bold text-foreground">{isLoading ? '—' : s.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
                <div className="text-[11px] font-semibold mt-2 text-primary">{s.cta} →</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left col — 2/3 width */}
        <div className="lg:col-span-2 space-y-5">

          {/* Recent Requests */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Recent Requests</h3>
              </div>
              <Link href={user?.role === 'shelter' ? '/adoption-requests' : '/my-requests'}>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="p-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-2">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRequests.slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <PawPrint className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{req.pet?.name || 'Pet'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user?.role === 'shelter' ? `From: ${req.adopter?.name}` : `To: ${req.shelter?.name}`}
                          {' · '}{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <StatusChip status={req.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pet section */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  {user?.role === 'shelter'
                    ? <PawPrint className="h-4 w-4 text-primary" />
                    : <Sparkles className="h-4 w-4 text-primary" />
                  }
                </div>
                <h3 className="font-semibold text-sm">
                  {user?.role === 'shelter' ? 'My Recent Pets' : 'Featured Pets'}
                </h3>
              </div>
              <Link href={user?.role === 'shelter' ? '/my-pets' : '/pets'}>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="p-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : recentPets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-2">
                    <PawPrint className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {user?.role === 'shelter' ? 'No pets added yet' : 'No pets available'}
                  </p>
                  {user?.role === 'shelter' && (
                    <Link href="/pets/create">
                      <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add First Pet</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recentPets.slice(0, 4).map((pet) => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col — 1/3 width */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link key={i} href={a.href} className="block">
                    <button className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      i === 0
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted/60 text-foreground hover:bg-muted'
                    }`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {a.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
