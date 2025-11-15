'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, PawPrint, FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      loadStats();
    }
  }, [user, router]);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and monitor platform activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totals.users || 0}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +{stats?.recent.users || 0} this week
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Shelters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shelters</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totals.shelters || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Active shelters</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Pets */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totals.pets || 0}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +{stats?.recent.pets || 0} this week
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Requests */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adoption Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totals.requests || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-2 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {stats?.totals.pendingRequests || 0} pending
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/pets">
              <Button variant="outline" className="w-full">
                <PawPrint className="mr-2 h-4 w-4" />
                Manage Pets
              </Button>
            </Link>
            <Link href="/admin/logs">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Activity Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* User Distribution */}
      {stats?.usersByRole && (
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Adopters</span>
                <span className="font-semibold">{stats.usersByRole.adopter || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shelters</span>
                <span className="font-semibold">{stats.usersByRole.shelter || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admins</span>
                <span className="font-semibold">{stats.usersByRole.admin || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pet Status Distribution */}
      {stats?.petsByStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Pet Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-semibold text-green-600">
                  {stats.petsByStatus.available || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {stats.petsByStatus.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Adopted</span>
                <span className="font-semibold text-blue-600">
                  {stats.petsByStatus.adopted || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
