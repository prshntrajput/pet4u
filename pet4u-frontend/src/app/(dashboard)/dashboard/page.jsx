'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Heart, 
  FileText,
  Eye,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { petAPI } from '@/lib/api/pets';
import { favoriteAPI } from '@/lib/api/favorites';
import { adoptionRequestAPI } from '@/lib/api/adoptionRequests';
import PetCard from '../../_component/pets/PetCard';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalPets: 0,
    myFavorites: 0,
    myRequests: 0,
    receivedRequests: 0,
    pendingRequests: 0,
  });
  const [recentPets, setRecentPets] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user.role === 'shelter') {
        const [petsRes, requestsRes] = await Promise.all([
          petAPI.getMyPets({ limit: 3, page: 1 }),
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
          petAPI.getAllPets({ limit: 3, page: 1 }),
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

  if (user?.role === 'admin') {
    router.push('/admin');
    return null;
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-accent-foreground' },
      approved: { variant: 'default', icon: CheckCircle, color: 'text-primary' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-destructive' },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'shelter' 
              ? 'Here\'s what\'s happening with your pets today' 
              : 'Discover pets waiting for their forever home'}
          </p>
        </div>
        {user?.role === 'shelter' && (
          <Link href="/pets/create">
            <Button size="lg" className="shadow-lg">
              <PawPrint className="mr-2 h-5 w-5" />
              Add New Pet
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {user?.role === 'shelter' ? (
          <>
            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pets
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPets}</div>
                <Link href="/my-pets">
                  <p className="text-xs text-primary hover:underline mt-2 flex items-center">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </CardTitle>
                <div className="p-2 bg-accent/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingRequests}</div>
                <Link href="/received-requests">
                  <p className="text-xs text-primary hover:underline mt-2 flex items-center">
                    Review now <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.receivedRequests}</div>
                <Link href="/analytics">
                  <p className="text-xs text-primary hover:underline mt-2 flex items-center">
                    View analytics <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  My Favorites
                </CardTitle>
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Heart className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.myFavorites}</div>
                <Link href="/favorites">
                  <p className="text-xs text-destructive hover:underline mt-2 flex items-center">
                    View saved <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  My Requests
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.myRequests}</div>
                <Link href="/my-requests">
                  <p className="text-xs text-primary hover:underline mt-2 flex items-center">
                    Track status <ArrowRight className="h-3 w-3 ml-1" />
                  </p>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <div className="p-2 bg-accent/50 rounded-lg">
                  <Clock className="h-5 w-5 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting response</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Requests */}
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Recent Requests
              </CardTitle>
              <Link href={user?.role === 'shelter' ? '/received-requests' : '/my-requests'}>
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:border-primary/50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {request.pet?.name || 'Pet'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.role === 'shelter' 
                            ? `From: ${request.adopter?.name}`
                            : `To: ${request.shelter?.name}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Pets or Featured Pets */}
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                {user?.role === 'shelter' ? (
                  <>
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <PawPrint className="h-4 w-4 text-primary" />
                    </div>
                    My Recent Pets
                  </>
                ) : (
                  <>
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    Featured Pets
                  </>
                )}
              </CardTitle>
              <Link href={user?.role === 'shelter' ? '/my-pets' : '/pets'}>
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentPets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <PawPrint className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {user?.role === 'shelter' ? 'No pets added yet' : 'No pets available'}
                  </p>
                  {user?.role === 'shelter' && (
                    <Link href="/pets/create">
                      <Button>Add Your First Pet</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentPets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} compact />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar - Takes 1 column */}
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user?.role === 'shelter' ? (
                <>
                  <Link href="/pets/create" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <PawPrint className="mr-2 h-4 w-4" />
                      Add New Pet
                    </Button>
                  </Link>
                  <Link href="/my-pets" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <Eye className="mr-2 h-4 w-4" />
                      Manage Pets
                    </Button>
                  </Link>
                  <Link href="/received-requests" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <FileText className="mr-2 h-4 w-4" />
                      View Requests
                    </Button>
                  </Link>
                  <Link href="/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pets" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <PawPrint className="mr-2 h-4 w-4" />
                      Browse Pets
                    </Button>
                  </Link>
                  <Link href="/search" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Advanced Search
                    </Button>
                  </Link>
                  <Link href="/favorites" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <Heart className="mr-2 h-4 w-4" />
                      My Favorites
                    </Button>
                  </Link>
                  <Link href="/my-requests" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <FileText className="mr-2 h-4 w-4" />
                      My Requests
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-start border-2">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                🎉 PET4U Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Pets Available</span>
                <span className="font-bold text-primary">150+</span>
              </div>
              <div className="flex justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Active Shelters</span>
                <span className="font-bold text-primary">45</span>
              </div>
              <div className="flex justify-between p-2 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Successful Adoptions</span>
                <span className="font-bold text-primary">230+</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
