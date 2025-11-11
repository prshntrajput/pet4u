'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { petAPI } from '@/lib/api/pets';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function MyPetsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user && user.role === 'shelter') {
      loadMyPets();
    }
  }, [user, activeTab]);

  const loadMyPets = async () => {
    setIsLoading(true);
    try {
      const response = await petAPI.getMyPets({ status: activeTab });
      if (response.success) {
        setPets(response.data.data.pets);
      }
    } catch (error) {
      toast.error('Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!confirm('Are you sure you want to delete this pet listing? This action cannot be undone.')) {
      return;
    }

    setDeletingId(petId);
    try {
      const response = await petAPI.deletePet(petId);
      if (response.success) {
        toast.success('Pet listing deleted successfully');
        setPets(pets.filter(pet => pet.id !== petId));
      } else {
        toast.error(response.error || 'Failed to delete pet');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  if (user.role !== 'shelter') {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          This page is only accessible to shelter accounts.
        </p>
        <Button onClick={() => router.push('/pets')}>
          Browse Available Pets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pet Listings</h1>
          <p className="text-gray-600 mt-2">Manage your pet listings and adoption requests</p>
        </div>
        <Link href="/pets/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Pet
          </Button>
        </Link>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="adopted">Adopted</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No {activeTab} pets
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'available' 
                  ? 'Create your first pet listing to get started'
                  : `You don't have any ${activeTab} pets yet`
                }
              </p>
              {activeTab === 'available' && (
                <Link href="/pets/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Pet Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden">
                  {/* Pet Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {pet.primaryImage ? (
                      <Image
                        src={pet.primaryImage}
                        alt={pet.name}
                        fill
                        className="object-cover"
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
                          pet.adoptionStatus === 'available' ? 'success' :
                          pet.adoptionStatus === 'pending' ? 'secondary' :
                          'default'
                        }
                      >
                        {pet.adoptionStatus}
                      </Badge>
                    </div>

                    {pet.isUrgent && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                    )}
                  </div>

                  {/* Pet Info */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {pet.breed || pet.species}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {pet.age} {pet.ageUnit} • {pet.gender}
                      </span>
                      <span className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {pet.viewCount} views
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <Link href={`/pets/${pet.slug || pet.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      
                      <Link href={`/pets/edit/${pet.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pet.id)}
                        disabled={deletingId === pet.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingId === pet.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
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
