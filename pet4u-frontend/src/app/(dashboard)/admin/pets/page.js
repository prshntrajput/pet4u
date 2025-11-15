'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Trash2, Eye, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPetsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      loadPets();
    }
  }, [user, router, statusFilter]);

  const loadPets = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await adminAPI.getAllPets(params);
      if (response.success) {
        setPets(response.data.data.pets);
      }
    } catch (error) {
      toast.error('Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (!confirm(`Are you sure you want to delete pet "${petName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(petId);
    try {
      const response = await adminAPI.deletePet(petId);
      if (response.success) {
        toast.success('Pet deleted successfully');
        loadPets();
      }
    } catch (error) {
      toast.error('Failed to delete pet');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPets();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pet Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all pet listings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="adopted">Adopted</option>
            </select>

            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Pets List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600">No pets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id}>
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
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                  <p className="text-sm text-gray-600">
                    {pet.breed || pet.species} • {pet.age} {pet.ageUnit} • {pet.gender}
                  </p>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-1" />
                  {pet.city}, {pet.state}
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Owner:</strong> {pet.owner.name}</p>
                  <p className="text-xs text-gray-500">{pet.owner.email}</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Link href={`/pets/${pet.slug || pet.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePet(pet.id, pet.name)}
                    disabled={deletingId === pet.id}
                    className="text-red-600 hover:text-red-700"
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
    </div>
  );
}
