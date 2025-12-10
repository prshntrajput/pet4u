'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { analyticsAPI } from '@/lib/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Eye, Heart, FileText, PawPrint, Calendar, BarChart3, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    if (user && user.role !== 'shelter') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'shelter') {
      loadAnalytics();
    }
  }, [user, router, dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await analyticsAPI.getShelterAnalytics({ dateRange });
      if (response.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'shelter') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Track your shelters performance
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="flex h-10 rounded-md border-2 border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pets</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.overview.totalPets || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.overview.totalViews || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-accent/50 rounded-xl flex items-center justify-center border-2 border-accent">
                <Eye className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Favorites</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.overview.totalFavorites || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center border-2 border-destructive/20">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold mt-2">
                  {analytics?.overview.totalRequests || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Recent Activity ({dateRange} days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">New Adoption Requests</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">
                  {analytics?.recentActivity.requests || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pets by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <PawPrint className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Pets by Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Available</span>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {analytics?.petsByStatus.available || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Pending</span>
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  {analytics?.petsByStatus.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Adopted</span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  {analytics?.petsByStatus.adopted || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Requests by Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Pending</span>
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  {analytics?.requestsByStatus.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Approved</span>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {analytics?.requestsByStatus.approved || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Rejected</span>
                <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-sm font-bold">
                  {analytics?.requestsByStatus.rejected || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Pets */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Most Viewed Pets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.mostViewedPets && analytics.mostViewedPets.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostViewedPets.map((pet, index) => (
                <div key={pet.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-2 border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed || pet.species} • {pet.age} {pet.ageUnit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border-2 border-primary/20">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">{pet.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
