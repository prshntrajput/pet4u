'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreatePetForm from '@/app/_component/pets/CreatePetForm';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePetPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();

  // Only shelters can create pet listings
  useEffect(() => {
    if (user && user.role !== 'shelter') {
      router.push('/pets');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (user.role !== 'shelter') {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          Only shelter accounts can create pet listings.
        </p>
        <Button onClick={() => router.push('/pets')}>
          Browse Available Pets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Pet Listing</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to create a new pet listing for adoption
        </p>
      </div>

      <CreatePetForm />
    </div>
  );
}
