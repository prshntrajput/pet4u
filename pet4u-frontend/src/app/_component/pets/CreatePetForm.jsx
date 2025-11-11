'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPetSchema } from '@/lib/validations/petSchema';
import { useDispatch, useSelector } from 'react-redux';
import { createPet } from '@/lib/store/slices/petSlice';
import { petAPI } from '@/lib/api/pets';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Upload } from 'lucide-react';

export default function CreatePetForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { isCreating } = useSelector((state) => state.pets);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPetSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      breed: '',
      mixedBreed: false,
      age: '',
      ageUnit: 'months',
      ageEstimated: false,
      gender: 'male',
      size: 'medium',
      weight: '',
      color: '',
      markings: '',
      isVaccinated: false,
      isNeutered: false,
      isSpayed: false,
      healthStatus: 'healthy',
      medicalHistory: '',
      specialNeeds: '',
      goodWithKids: false,
      goodWithPets: false,
      goodWithCats: false,
      goodWithDogs: false,
      energyLevel: 'medium',
      trainedLevel: 'not_trained',
      houseTrained: false,
      adoptionFee: 0,
      isUrgent: false,
      urgentReason: '',
      city: user?.city || '',
      state: user?.state || '',
      description: '',
      story: '',
    },
  });

  const watchIsUrgent = watch('isUrgent');
  const watchSpecies = watch('species');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 10) {
      toast.error('You can only upload up to 10 images');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);

    // Create preview URLs
    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const onSubmit = async (data) => {
    try {
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        adoptionFee: data.adoptionFee ? parseFloat(data.adoptionFee) : 0,
      };

      // Create pet
      const result = await dispatch(createPet(formattedData)).unwrap();
      
      // Upload images if any
      if (selectedFiles.length > 0 && result.id) {
        setIsUploading(true);
        try {
          await petAPI.uploadPetImages(result.id, selectedFiles);
          toast.success('Pet created and images uploaded successfully!');
        } catch (uploadError) {
          toast.warning('Pet created but some images failed to upload');
        }
        setIsUploading(false);
      } else {
        toast.success('Pet created successfully!');
      }

      router.push(`/pets/${result.slug || result.id}`);
      
    } catch (error) {
      toast.error(error || 'Failed to create pet listing');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <select
                id="species"
                {...register('species')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="hamster">Hamster</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                {...register('breed')}
                placeholder="e.g., Labrador Retriever"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="mixedBreed"
                {...register('mixedBreed')}
              />
              <Label htmlFor="mixedBreed" className="font-normal cursor-pointer">
                Mixed Breed
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageUnit">Age Unit</Label>
              <select
                id="ageUnit"
                {...register('ageUnit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="ageEstimated"
                {...register('ageEstimated')}
              />
              <Label htmlFor="ageEstimated" className="font-normal cursor-pointer">
                Estimated
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                {...register('size')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra_large">Extra Large</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...register('color')}
                placeholder="e.g., Brown, Black & White"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markings">Markings</Label>
              <Input
                id="markings"
                {...register('markings')}
                placeholder="e.g., White spot on chest"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle>Health Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVaccinated"
                {...register('isVaccinated')}
              />
              <Label htmlFor="isVaccinated" className="font-normal cursor-pointer">
                Vaccinated
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNeutered"
                {...register('isNeutered')}
              />
              <Label htmlFor="isNeutered" className="font-normal cursor-pointer">
                Neutered
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSpayed"
                {...register('isSpayed')}
              />
              <Label htmlFor="isSpayed" className="font-normal cursor-pointer">
                Spayed
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="houseTrained"
                {...register('houseTrained')}
              />
              <Label htmlFor="houseTrained" className="font-normal cursor-pointer">
                House Trained
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthStatus">Health Status</Label>
            <select
              id="healthStatus"
              {...register('healthStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="healthy">Healthy</option>
              <option value="recovering">Recovering</option>
              <option value="special_needs">Special Needs</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...register('medicalHistory')}
              rows={3}
              placeholder="Any past illnesses, surgeries, or ongoing treatments..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Special Needs</Label>
            <Textarea
              id="specialNeeds"
              {...register('specialNeeds')}
              rows={2}
              placeholder="Any special care requirements..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Traits */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Traits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="goodWithKids"
                {...register('goodWithKids')}
              />
              <Label htmlFor="goodWithKids" className="font-normal cursor-pointer">
                Good with Kids
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="goodWithPets"
                {...register('goodWithPets')}
              />
              <Label htmlFor="goodWithPets" className="font-normal cursor-pointer">
                Good with Pets
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="goodWithCats"
                {...register('goodWithCats')}
              />
              <Label htmlFor="goodWithCats" className="font-normal cursor-pointer">
                Good with Cats
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="goodWithDogs"
                {...register('goodWithDogs')}
              />
              <Label htmlFor="goodWithDogs" className="font-normal cursor-pointer">
                Good with Dogs
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energy Level</Label>
              <select
                id="energyLevel"
                {...register('energyLevel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainedLevel">Training Level</Label>
              <select
                id="trainedLevel"
                {...register('trainedLevel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="not_trained">Not Trained</option>
                <option value="basic">Basic Training</option>
                <option value="advanced">Advanced Training</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description & Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={5}
              placeholder="Describe the pet's personality, habits, and what makes them special..."
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Pet's Story (Optional)</Label>
            <Textarea
              id="story"
              {...register('story')}
              rows={4}
              placeholder="Share the pet's background, how they came to you, etc..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Adoption Details */}
      <Card>
        <CardHeader>
          <CardTitle>Adoption Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adoptionFee">Adoption Fee (₹)</Label>
            <Input
              id="adoptionFee"
              type="number"
              step="0.01"
              {...register('adoptionFee', { valueAsNumber: true })}
            />
            <p className="text-sm text-gray-500">Set to 0 for free adoption</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isUrgent"
              {...register('isUrgent')}
            />
            <Label htmlFor="isUrgent" className="font-normal cursor-pointer">
              Mark as Urgent Adoption
            </Label>
          </div>

          {watchIsUrgent && (
            <div className="space-y-2">
              <Label htmlFor="urgentReason">Urgent Reason *</Label>
              <Textarea
                id="urgentReason"
                {...register('urgentReason')}
                rows={2}
                placeholder="Explain why this adoption is urgent..."
                className={errors.urgentReason ? 'border-red-500' : ''}
              />
              {errors.urgentReason && (
                <p className="text-sm text-red-500">{errors.urgentReason.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder={user?.city || 'Mumbai'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder={user?.state || 'Maharashtra'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Pet Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="images">Upload Images (Max 10)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG or WEBP. Max size 10MB per image.
            </p>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isCreating || isUploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isCreating || isUploading}
        >
          {isCreating || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? 'Uploading Images...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Pet Listing
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
