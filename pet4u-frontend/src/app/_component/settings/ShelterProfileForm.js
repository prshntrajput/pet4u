'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createShelterProfileSchema, updateShelterProfileSchema } from '@/lib/validations/userSchema';
import { shelterAPI } from '@/lib/api/user';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Building2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShelterProfileForm() {
  const [shelterProfile, setShelterProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isEditMode = !!shelterProfile;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(isEditMode ? updateShelterProfileSchema : createShelterProfileSchema),
    defaultValues: {
      organizationName: '',
      registrationNumber: '',
      licenseNumber: '',
      website: '',
      description: '',
      establishedYear: '',
      capacity: '',
      currentPetCount: '',
    },
  });

  // Fetch shelter profile on mount
  useEffect(() => {
    fetchShelterProfile();
  }, []);

  const fetchShelterProfile = async () => {
    setIsLoading(true);
    try {
      const response = await shelterAPI.getOwnShelterProfile();
      
      if (response.success) {
        const shelter = response.data.data.shelter;
        setShelterProfile(shelter);
        reset({
          organizationName: shelter.organizationName || '',
          registrationNumber: shelter.registrationNumber || '',
          licenseNumber: shelter.licenseNumber || '',
          website: shelter.website || '',
          description: shelter.description || '',
          establishedYear: shelter.establishedYear || '',
          capacity: shelter.capacity || '',
          currentPetCount: shelter.currentPetCount || '',
        });
      }
    } catch (error) {
      // Profile doesn't exist yet, user needs to create one
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (isEditMode) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleCreate = async (data) => {
    setIsCreating(true);
    
    try {
      // Convert string numbers to integers
      const formattedData = {
        ...data,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
      };

      const response = await shelterAPI.createShelterProfile(formattedData);
      
      if (response.success) {
        toast.success('Shelter profile created successfully!');
        setShelterProfile(response.data.data.shelter);
        reset(data);
      } else {
        toast.error(response.error || 'Failed to create shelter profile');
      }
    } catch (error) {
      toast.error('An error occurred while creating shelter profile');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data) => {
    setIsSaving(true);
    
    try {
      // Convert string numbers to integers
      const formattedData = {
        ...data,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        currentPetCount: data.currentPetCount ? parseInt(data.currentPetCount) : undefined,
      };

      const response = await shelterAPI.updateShelterProfile(formattedData);
      
      if (response.success) {
        toast.success('Shelter profile updated successfully!');
        setShelterProfile(response.data.data.shelter);
        reset(data);
      } else {
        toast.error(response.error || 'Failed to update shelter profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating shelter profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Badge */}
      {isEditMode && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Verification Status</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your shelter profile is currently under review
              </p>
            </div>
          </div>
          <Badge 
            variant={
              shelterProfile.verificationStatus === 'approved' ? 'success' :
              shelterProfile.verificationStatus === 'rejected' ? 'destructive' :
              'secondary'
            }
          >
            {shelterProfile.verificationStatus || 'pending'}
          </Badge>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="Happy Paws Animal Shelter"
            {...register('organizationName')}
            className={errors.organizationName ? 'border-red-500' : ''}
            disabled={isSaving || isCreating}
          />
          {errors.organizationName && (
            <p className="text-sm text-red-500">{errors.organizationName.message}</p>
          )}
        </div>

        {/* Registration and License Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              type="text"
              placeholder="REG123456"
              {...register('registrationNumber')}
              className={errors.registrationNumber ? 'border-red-500' : ''}
              disabled={isSaving || isCreating}
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              type="text"
              placeholder="LIC789012"
              {...register('licenseNumber')}
              className={errors.licenseNumber ? 'border-red-500' : ''}
              disabled={isSaving || isCreating}
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
            )}
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            {...register('website')}
            className={errors.website ? 'border-red-500' : ''}
            disabled={isSaving || isCreating}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tell people about your shelter, mission, and the animals you care for..."
            rows={5}
            {...register('description')}
            className={errors.description ? 'border-red-500' : ''}
            disabled={isSaving || isCreating}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Established Year and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established Year</Label>
            <Input
              id="establishedYear"
              type="number"
              placeholder="2020"
              {...register('establishedYear')}
              className={errors.establishedYear ? 'border-red-500' : ''}
              disabled={isSaving || isCreating}
            />
            {errors.establishedYear && (
              <p className="text-sm text-red-500">{errors.establishedYear.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="50"
              {...register('capacity')}
              className={errors.capacity ? 'border-red-500' : ''}
              disabled={isSaving || isCreating}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity.message}</p>
            )}
          </div>

          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="currentPetCount">Current Pet Count</Label>
              <Input
                id="currentPetCount"
                type="number"
                placeholder="25"
                {...register('currentPetCount')}
                className={errors.currentPetCount ? 'border-red-500' : ''}
                disabled={isSaving || isCreating}
              />
              {errors.currentPetCount && (
                <p className="text-sm text-red-500">{errors.currentPetCount.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSaving || isCreating || (isEditMode && !isDirty)}
            className="w-full md:w-auto"
          >
            {(isSaving || isCreating) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Shelter Profile
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
