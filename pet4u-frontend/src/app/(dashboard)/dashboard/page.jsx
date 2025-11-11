'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Users, Heart, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth({ requireAuth: true });

  const stats = [
    { label: 'Available Pets', value: '150+', icon: PawPrint, color: 'text-blue-600' },
    { label: 'Active Shelters', value: '45', icon: Users, color: 'text-green-600' },
    { label: 'Favorites', value: '0', icon: Heart, color: 'text-red-600' },
    { label: 'Adoptions', value: '230', icon: CheckCircle, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h2>
        <p className="text-gray-600">
          Ready to find your perfect companion today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Pet browsing and adoption features will be added in Day 2!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
