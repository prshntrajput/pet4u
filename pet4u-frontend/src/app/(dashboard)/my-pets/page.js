'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { petAPI } from '@/lib/api/pets';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Edit, Trash2, Eye, AlertCircle, Heart, PawPrint, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function MyPetsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  
  const [allPets, setAllPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'shelter') {
      loadMyPets();
    }
  }, [user?.role]);

  const loadMyPets = async () => {
    setIsLoading(true);
    try {
      const response = await petAPI.getMyPets();
      
      if (response.success) {
        const petsData = response.data?.data?.pets || response.data?.pets || [];
        setAllPets(petsData);
      } else {
        throw new Error(response.error || 'Failed to load pets');
      }
    } catch (error) {
      console.error('Load pets error:', error);
      toast.error(error.message || 'Failed to load pets');
      setAllPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPets = allPets.filter(pet => pet.adoptionStatus === activeTab);

  const handleDelete = async (petId) => {
    if (!confirm('Are you sure you want to delete this pet listing? This action cannot be undone.')) {
      return;
    }

    setDeletingId(petId);
    try {
      const response = await petAPI.deletePet(petId);
      if (response.success) {
        toast.success('Pet listing deleted successfully');
        setAllPets(prevPets => prevPets.filter(pet => pet.id !== petId));
      } else {
        throw new Error(response.error || 'Failed to delete pet');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'shelter') {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          This page is only accessible to shelter accounts.
        </p>
        <Button onClick={() => router.push('/pets')} size="lg" className="shadow-lg">
          Browse Available Pets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">My Pet Listings</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your pet listings and adoption requests
          </p>
        </div>
        <Link href="/pets/create">
          <Button size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New Pet
          </Button>
        </Link>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="available" className="text-sm">
            Available ({allPets.filter(p => p.adoptionStatus === 'available').length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">
            Pending ({allPets.filter(p => p.adoptionStatus === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="adopted" className="text-sm">
            Adopted ({allPets.filter(p => p.adoptionStatus === 'adopted').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <PawPrint className="h-24 w-24 text-primary/20" />
                  </div>
                  <PawPrint className="h-24 w-24 text-muted-foreground relative" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No {activeTab} pets
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {activeTab === 'available' 
                  ? 'Create your first pet listing to get started'
                  : `You don't have any ${activeTab} pets yet`
                }
              </p>
              {activeTab === 'available' && (
                <Link href="/pets/create">
                  <Button size="lg" className="shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Pet Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all">
                  {/* Pet Image */}
                  <div className="relative aspect-square bg-muted">
                    {pet.primaryImage ? (
                      <Image
                        src={pet.primaryImage}
                        alt={pet.name || 'Pet'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-6xl">
                        🐾
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          pet.adoptionStatus === 'available' ? 'default' :
                          pet.adoptionStatus === 'pending' ? 'secondary' :
                          pet.adoptionStatus === 'adopted' ? 'outline' :
                          'outline'
                        }
                        className="capitalize shadow-md"
                      >
                        {pet.adoptionStatus || 'Unknown'}
                      </Badge>
                    </div>

                    {pet.isUrgent && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="flex items-center gap-1 shadow-md">
                          <AlertCircle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Pet Info */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold truncate">
                        {pet.name || 'Unnamed Pet'}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {pet.breed || pet.species || 'Unknown breed'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {pet.age || '?'} {pet.ageUnit || 'years'} • {pet.gender || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {pet.viewCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {pet.inquiryCount || 0} inquiries
                      </span>
                      {pet.adoptionFee > 0 && (
                        <span className="font-semibold text-primary">
                          ₹{pet.adoptionFee}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <Link href={`/pets/${pet.slug || pet.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 border-2"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/pets/edit/${pet.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 border-2"
                          title="Edit"
                          disabled={pet.adoptionStatus === 'adopted'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pet.id)}
                        disabled={deletingId === pet.id || pet.adoptionStatus === 'adopted'}
                        className="h-9 border-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        {deletingId === pet.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
