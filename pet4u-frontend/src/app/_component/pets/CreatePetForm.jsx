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
import { Loader2, Save, Upload, Info, Heart, Activity, FileText, MapPin, Image as ImageIcon, X } from 'lucide-react';

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

    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        adoptionFee: data.adoptionFee ? parseFloat(data.adoptionFee) : 0,
      };

      const result = await dispatch(createPet(formattedData)).unwrap();
      
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
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Pet Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className={`h-10 border-2 ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species" className="text-sm font-semibold">
                Species <span className="text-destructive">*</span>
              </Label>
              <select
                id="species"
                {...register('species')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <Label htmlFor="breed" className="text-sm font-semibold">Breed</Label>
              <Input
                id="breed"
                {...register('breed')}
                placeholder="e.g., Labrador Retriever"
                className="h-10 border-2"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="mixedBreed" {...register('mixedBreed')} />
              <Label htmlFor="mixedBreed" className="text-sm font-normal cursor-pointer">
                Mixed Breed
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="h-10 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageUnit" className="text-sm font-semibold">Age Unit</Label>
              <select
                id="ageUnit"
                {...register('ageUnit')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="ageEstimated" {...register('ageEstimated')} />
              <Label htmlFor="ageEstimated" className="text-sm font-normal cursor-pointer">
                Estimated
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold">
                Gender <span className="text-destructive">*</span>
              </Label>
              <select
                id="gender"
                {...register('gender')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm font-semibold">Size</Label>
              <select
                id="size"
                {...register('size')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra_large">Extra Large</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-semibold">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight', { valueAsNumber: true })}
                className="h-10 border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-semibold">Color</Label>
              <Input
                id="color"
                {...register('color')}
                placeholder="e.g., Brown, Black & White"
                className="h-10 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markings" className="text-sm font-semibold">Markings</Label>
              <Input
                id="markings"
                {...register('markings')}
                placeholder="e.g., White spot on chest"
                className="h-10 border-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Health Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="isVaccinated" {...register('isVaccinated')} />
              <Label htmlFor="isVaccinated" className="text-sm font-normal cursor-pointer">
                Vaccinated
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isNeutered" {...register('isNeutered')} />
              <Label htmlFor="isNeutered" className="text-sm font-normal cursor-pointer">
                Neutered
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isSpayed" {...register('isSpayed')} />
              <Label htmlFor="isSpayed" className="text-sm font-normal cursor-pointer">
                Spayed
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="houseTrained" {...register('houseTrained')} />
              <Label htmlFor="houseTrained" className="text-sm font-normal cursor-pointer">
                House Trained
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthStatus" className="text-sm font-semibold">Health Status</Label>
            <select
              id="healthStatus"
              {...register('healthStatus')}
              className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="healthy">Healthy</option>
              <option value="recovering">Recovering</option>
              <option value="special_needs">Special Needs</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory" className="text-sm font-semibold">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...register('medicalHistory')}
              rows={3}
              placeholder="Any past illnesses, surgeries, or ongoing treatments..."
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeeds" className="text-sm font-semibold">Special Needs</Label>
            <Textarea
              id="specialNeeds"
              {...register('specialNeeds')}
              rows={2}
              placeholder="Any special care requirements..."
              className="border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Traits */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Behavioral Traits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="goodWithKids" {...register('goodWithKids')} />
              <Label htmlFor="goodWithKids" className="text-sm font-normal cursor-pointer">
                Good with Kids
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="goodWithPets" {...register('goodWithPets')} />
              <Label htmlFor="goodWithPets" className="text-sm font-normal cursor-pointer">
                Good with Pets
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="goodWithCats" {...register('goodWithCats')} />
              <Label htmlFor="goodWithCats" className="text-sm font-normal cursor-pointer">
                Good with Cats
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="goodWithDogs" {...register('goodWithDogs')} />
              <Label htmlFor="goodWithDogs" className="text-sm font-normal cursor-pointer">
                Good with Dogs
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyLevel" className="text-sm font-semibold">Energy Level</Label>
              <select
                id="energyLevel"
                {...register('energyLevel')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainedLevel" className="text-sm font-semibold">Training Level</Label>
              <select
                id="trainedLevel"
                {...register('trainedLevel')}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Description & Story</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={5}
              placeholder="Describe the pet's personality, habits, and what makes them special..."
              className={`border-2 ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story" className="text-sm font-semibold">Pet's Story (Optional)</Label>
            <Textarea
              id="story"
              {...register('story')}
              rows={4}
              placeholder="Share the pet's background, how they came to you, etc..."
              className="border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Adoption Details */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Adoption Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adoptionFee" className="text-sm font-semibold">Adoption Fee (₹)</Label>
            <Input
              id="adoptionFee"
              type="number"
              step="0.01"
              {...register('adoptionFee', { valueAsNumber: true })}
              className="h-10 border-2"
            />
            <p className="text-xs text-muted-foreground">Set to 0 for free adoption</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isUrgent" {...register('isUrgent')} />
            <Label htmlFor="isUrgent" className="text-sm font-normal cursor-pointer">
              Mark as Urgent Adoption
            </Label>
          </div>

          {watchIsUrgent && (
            <div className="space-y-2 p-3 bg-destructive/5 rounded-lg border-2 border-destructive/30">
              <Label htmlFor="urgentReason" className="text-sm font-semibold">
                Urgent Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="urgentReason"
                {...register('urgentReason')}
                rows={2}
                placeholder="Explain why this adoption is urgent..."
                className={`border-2 ${errors.urgentReason ? 'border-destructive' : ''}`}
              />
              {errors.urgentReason && (
                <p className="text-xs text-destructive">{errors.urgentReason.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder={user?.city || 'Mumbai'}
                className="h-10 border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-semibold">State</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder={user?.state || 'Maharashtra'}
                className="h-10 border-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Pet Images</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="images" className="text-sm font-semibold">Upload Images (Max 10)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-2 h-10 border-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WEBP. Max size 10MB per image.
            </p>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isCreating || isUploading}
          className="border-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isCreating || isUploading}
          className="shadow-lg"
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
