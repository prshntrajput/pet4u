'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Calendar,
  PawPrint,
  Star,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import apiWrapper from '@/lib/api/axios';
import { petAPI } from '@/lib/api/pets';
import PetCard from '@/app/_component/pets/PetCard';

export default function ShelterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [shelter, setShelter] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params?.shelterId) return;
    loadShelter(params.shelterId);
  }, [params?.shelterId]);

  const loadShelter = async (shelterId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiWrapper.get(`/shelters/${shelterId}`);
      if (res.success) {
        const data = res.data.data;
        setShelter(data);
        loadShelterPets(data.user?.id || shelterId);
      } else {
        setError('Shelter not found');
      }
    } catch {
      setError('Failed to load shelter');
    } finally {
      setIsLoading(false);
    }
  };

  const loadShelterPets = async (ownerId) => {
    setPetsLoading(true);
    try {
      const res = await petAPI.getAllPets({ ownerId, status: 'available', limit: 12 });
      if (res.success) {
        setPets(res.data.data?.pets || []);
      }
    } catch {
      // non-fatal
    } finally {
      setPetsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="h-14 w-14 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">{error || 'Shelter not found'}</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const rating = parseFloat(shelter.averageRating) || 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={shelter.user?.profileImage} alt={shelter.organizationName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {shelter.organizationName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{shelter.organizationName}</h1>
                {shelter.verificationStatus === 'approved' && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {(shelter.user?.city || shelter.user?.state) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {[shelter.user.city, shelter.user.state, shelter.user.country].filter(Boolean).join(', ')}
                </div>
              )}

              {rating > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({shelter.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            {user && user.id !== shelter.user?.id && (
              <Button
                variant="outline"
                onClick={() => router.push(`/messages/${shelter.user?.id}`)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Message
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-base">Shelter Details</h2>
              <div className="space-y-3 text-sm">
                {shelter.establishedYear && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Est. {shelter.establishedYear}</span>
                  </div>
                )}
                {shelter.capacity && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>Capacity: {shelter.capacity} pets</span>
                  </div>
                )}
                {shelter.currentPetCount !== undefined && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PawPrint className="h-4 w-4 shrink-0" />
                    <span>{shelter.currentPetCount} pets currently</span>
                  </div>
                )}
                {shelter.website && (
                  <a
                    href={shelter.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="truncate">{shelter.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Joined {new Date(shelter.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {shelter.description && (
            <Card>
              <CardContent className="p-5 space-y-2">
                <h2 className="font-semibold text-base">About</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {shelter.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Pets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Available Pets</h2>
            {pets.length > 0 && (
              <span className="text-sm text-muted-foreground">{pets.length} listed</span>
            )}
          </div>

          {petsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
                <PawPrint className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No available pets at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
