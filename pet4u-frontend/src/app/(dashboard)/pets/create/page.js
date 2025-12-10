'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreatePetForm from '@/app/_component/pets/CreatePetForm';
import { AlertCircle, PlusCircle, Sparkles } from 'lucide-react';
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
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Only shelter accounts can create pet listings.
        </p>
        <Button onClick={() => router.push('/pets')} size="lg" className="shadow-lg">
          Browse Available Pets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Create Pet Listing</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Fill in the details below to create a new pet listing for adoption
          </p>
        </div>

        {/* Info Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">New Listing</span>
        </div>
      </div>

      <CreatePetForm />
    </div>
  );
}
