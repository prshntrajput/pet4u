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
    { label: 'Total Pets',       value: stats.totalPets,        icon: PawPrint,    bg: 'bg-blue-50',    iconBg: 'bg-blue-100',    iconColor: 'text-primary',      href: '/my-pets',         cta: 'Manage pets' },
    { label: 'Pending Requests', value: stats.pendingRequests,  icon: AlertCircle, bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',    href: '/adoption-requests', cta: 'Review now'  },
    { label: 'Total Requests',   value: stats.receivedRequests, icon: FileText,    bg: 'bg-violet-50',  iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',   href: '/analytics',       cta: 'Analytics'   },
  ];

  const adopterStats = [
    { label: 'Saved Pets',   value: stats.myFavorites,    icon: Heart,    bg: 'bg-pink-50',    iconBg: 'bg-pink-100',    iconColor: 'text-pink-500',   href: '/favorites',   cta: 'View saved'    },
    { label: 'My Requests',  value: stats.myRequests,     icon: FileText, bg: 'bg-blue-50',    iconBg: 'bg-blue-100',    iconColor: 'text-primary',    href: '/my-requests', cta: 'Track status'  },
    { label: 'Pending',      value: stats.pendingRequests, icon: Clock,   bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',  href: '/my-requests', cta: 'Awaiting reply' },
  ];

  const statCards = user?.role === 'shelter' ? shelterStats : adopterStats;

  const shelterActions = [
    { href: '/pets/create',        icon: Plus,          label: 'Add New Pet',      color: 'bg-primary text-white hover:bg-primary/90' },
    { href: '/my-pets',            icon: PawPrint,      label: 'Manage Pets',      color: 'bg-blue-50 text-primary hover:bg-blue-100' },
    { href: '/adoption-requests',  icon: FileText,      label: 'View Requests',    color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { href: '/analytics',          icon: TrendingUp,    label: 'Analytics',        color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
    { href: '/messages',           icon: MessageSquare, label: 'Messages',         color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
  ];

  const adopterActions = [
    { href: '/pets',         icon: PawPrint,      label: 'Browse Pets',     color: 'bg-primary text-white hover:bg-primary/90' },
    { href: '/favorites',    icon: Heart,         label: 'My Favorites',    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
    { href: '/my-requests',  icon: FileText,      label: 'My Requests',     color: 'bg-blue-50 text-primary hover:bg-blue-100' },
    { href: '/messages',     icon: MessageSquare, label: 'Messages',        color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
    { href: '/search',       icon: Sparkles,      label: 'Search Pets',     color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  ];

  const quickActions = user?.role === 'shelter' ? shelterActions : adopterActions;

  return (
    <div className="space-y-6">

      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === 'shelter'
              ? "Here's what's happening with your pets today"
              : 'Discover pets waiting for their forever home'}
          </p>
        </div>
        {user?.role === 'shelter' && (
          <Link href="/pets/create">
            <Button size="sm" className="shadow-md">
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
              <div className={`${s.bg} rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl ${s.iconBg}`}>
                    <Icon className={`h-4 w-4 ${s.iconColor}`} />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{isLoading ? '—' : s.value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
                <div className={`text-[11px] font-semibold mt-2 ${s.iconColor}`}>{s.cta} →</div>
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
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
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
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm text-muted-foreground">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRequests.slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm">
                        🐾
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{req.pet?.name || 'Pet'}</p>
                        <p className="text-[11px] text-gray-400 truncate">
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
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
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
                  <div className="text-3xl mb-2">🐾</div>
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
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-base">⚡</span> Quick Actions
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link key={i} href={a.href} className="block">
                    <button className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${a.color}`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {a.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Platform impact */}
          <div className="bg-gradient-to-br from-primary/10 via-blue-50 to-teal-50 rounded-2xl p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5">
              <span>🎉</span> Pet4u Impact
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Pets Available',       value: '150+', emoji: '🐶' },
                { label: 'Active Shelters',       value: '45',   emoji: '🏠' },
                { label: 'Happy Adoptions',       value: '230+', emoji: '❤️' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span>{item.emoji}</span>{item.label}
                  </span>
                  <span className="text-sm font-bold text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
