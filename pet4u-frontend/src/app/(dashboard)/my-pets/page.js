'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { petAPI } from '@/lib/api/pets';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Edit, Trash2, Eye, AlertCircle, Heart, PawPrint, IndianRupee } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

const statusStyle = {
  available: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100  text-amber-700',
  adopted:   'bg-blue-100   text-blue-700',
};

export default function MyPetsPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();

  const [allPets, setAllPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'shelter') loadMyPets();
  }, [user?.role]);

  const loadMyPets = async () => {
    setIsLoading(true);
    try {
      const response = await petAPI.getMyPets();
      if (response.success) {
        setAllPets(response.data?.data?.pets || response.data?.pets || []);
      } else {
        throw new Error(response.error || 'Failed to load pets');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load pets');
      setAllPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(petId);
    try {
      const response = await petAPI.deletePet(petId);
      if (response.success) {
        toast.success('Pet listing deleted');
        setAllPets(prev => prev.filter(p => p.id !== petId));
      } else {
        throw new Error(response.error || 'Failed to delete pet');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPets = allPets.filter(p => p.adoptionStatus === activeTab);

  const tabCount = (status) => allPets.filter(p => p.adoptionStatus === status).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'shelter') {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6 text-sm">This page is only for shelter accounts.</p>
        <Button onClick={() => router.push('/pets')} size="sm">Browse Pets</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-xl bg-primary/10">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">My Pet Listings</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-9">Manage your listings and track adoption requests</p>
        </div>
        <Link href="/pets/create">
          <Button size="sm" className="shadow-md">
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Pet
          </Button>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Available', count: tabCount('available'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Pending',   count: tabCount('pending'),   color: 'bg-amber-50  text-amber-700  border-amber-200'  },
          { label: 'Adopted',   count: tabCount('adopted'),   color: 'bg-blue-50   text-blue-700   border-blue-200'   },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setActiveTab(s.label.toLowerCase())}
            className={`rounded-2xl border p-3 text-center transition-all hover:shadow-md ${s.color} ${activeTab === s.label.toLowerCase() ? 'shadow-md ring-2 ring-offset-1 ring-current/30' : ''}`}
          >
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9 w-full grid grid-cols-3">
          <TabsTrigger value="available" className="text-xs">Available ({tabCount('available')})</TabsTrigger>
          <TabsTrigger value="pending"   className="text-xs">Pending ({tabCount('pending')})</TabsTrigger>
          <TabsTrigger value="adopted"   className="text-xs">Adopted ({tabCount('adopted')})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🐾</div>
              <h3 className="text-lg font-bold mb-1">No {activeTab} pets</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {activeTab === 'available' ? 'Create your first pet listing to get started' : `No ${activeTab} pets yet`}
              </p>
              {activeTab === 'available' && (
                <Link href="/pets/create">
                  <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Create Listing</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredPets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-blue-50 overflow-hidden flex-shrink-0">
                    {pet.primaryImage ? (
                      <Image
                        src={pet.primaryImage}
                        alt={pet.name || 'Pet'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-3xl">🐾</div>
                    )}

                    {/* Status chip */}
                    <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyle[pet.adoptionStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {pet.adoptionStatus}
                    </span>

                    {pet.isUrgent && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                    <div>
                      <h3 className="font-bold text-sm leading-tight truncate">{pet.name || 'Unnamed'}</h3>
                      <p className="text-[11px] text-gray-400 truncate">{pet.breed || pet.species}</p>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-600 capitalize">{pet.gender || '?'}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-600">
                        {pet.age ? `${pet.age}${pet.ageUnit === 'years' ? 'yr' : 'mo'}` : '?'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                      <span className="flex items-center gap-0.5"><Eye size={9}/> {pet.viewCount || 0}</span>
                      <span className="flex items-center gap-0.5"><Heart size={9}/> {pet.inquiryCount || 0}</span>
                      {pet.adoptionFee > 0 ? (
                        <span className="flex items-center font-bold text-primary"><IndianRupee size={9}/>{pet.adoptionFee}</span>
                      ) : (
                        <span className="text-emerald-500 font-bold">Free</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-1">
                      <Link href={`/pets/${pet.slug || pet.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-7 text-[11px] px-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Link href={`/pets/edit/${pet.id}`} className="flex-1">
                        <Button
                          variant="outline" size="sm"
                          className="w-full h-7 text-[11px] px-0"
                          disabled={pet.adoptionStatus === 'adopted'}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline" size="sm"
                        className="flex-1 h-7 text-[11px] px-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(pet.id)}
                        disabled={deletingId === pet.id || pet.adoptionStatus === 'adopted'}
                      >
                        {deletingId === pet.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
