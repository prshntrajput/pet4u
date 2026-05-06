'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { petAPI } from '@/lib/api/pets';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2, Save, Info, Heart, Activity, FileText,
  MapPin, Image as ImageIcon, X, ArrowLeft, Plus, Stethoscope, Trash2,
} from 'lucide-react';

const SELECT_CLS =
  'flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export default function EditPetPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const petId = params.petId;

  const [pet, setPet] = useState(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Vet records
  const [vetRecords, setVetRecords] = useState([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', type: 'vaccination', name: '', vet: '', notes: '' });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();

  const watchIsUrgent = watch('isUrgent');

  useEffect(() => {
    if (!petId) return;
    loadPet();
  }, [petId]);

  const loadPet = async () => {
    try {
      const res = await petAPI.getPetById(petId);
      const p = res.data?.data?.pet || res.data?.data;
      if (!p) throw new Error('Pet not found');
      setPet(p);
      setExistingImages(p.images || []);
      setVetRecords(Array.isArray(p.vetRecords) ? p.vetRecords : []);
      reset({
        name: p.name || '',
        species: p.species || 'dog',
        breed: p.breed || '',
        mixedBreed: p.mixedBreed || false,
        age: p.age || '',
        ageUnit: p.ageUnit || 'months',
        ageEstimated: p.ageEstimated || false,
        gender: p.gender || 'male',
        size: p.size || 'medium',
        weight: p.weight || '',
        color: p.color || '',
        markings: p.markings || '',
        isVaccinated: p.isVaccinated || false,
        isNeutered: p.isNeutered || false,
        isSpayed: p.isSpayed || false,
        healthStatus: p.healthStatus || 'healthy',
        medicalHistory: p.medicalHistory || '',
        specialNeeds: p.specialNeeds || '',
        goodWithKids: p.goodWithKids || false,
        goodWithPets: p.goodWithPets || false,
        goodWithCats: p.goodWithCats || false,
        goodWithDogs: p.goodWithDogs || false,
        energyLevel: p.energyLevel || 'medium',
        trainedLevel: p.trainedLevel || 'not_trained',
        houseTrained: p.houseTrained || false,
        isUrgent: p.isUrgent || false,
        urgentReason: p.urgentReason || '',
        city: p.city || '',
        state: p.state || '',
        description: p.description || '',
        story: p.story || '',
        adoptionStatus: p.adoptionStatus || 'available',
        listingType: p.listingType || 'adopt',
      });
    } catch {
      toast.error('Failed to load pet details');
      router.push('/my-pets');
    } finally {
      setIsLoadingPet(false);
    }
  };

  const addVetRecord = () => {
    if (!newRecord.date || !newRecord.name.trim()) {
      toast.error('Date and record name are required');
      return;
    }
    setVetRecords((prev) => [...prev, { ...newRecord, id: `rec_${Date.now()}` }]);
    setNewRecord({ date: '', type: 'vaccination', name: '', vet: '', notes: '' });
    setShowAddRecord(false);
  };

  const removeVetRecord = (id) => setVetRecords((prev) => prev.filter((r) => r.id !== id));

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} exceeds 10MB`); return false; }
      return true;
    });
    setSelectedFiles(valid);
    setPreviewUrls(valid.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId) => {
    setDeletingImageId(imageId);
    try {
      await petAPI.deletePetImage(petId, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        vetRecords,
      };
      await petAPI.updatePet(petId, payload);

      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          await petAPI.uploadPetImages(petId, selectedFiles);
        } catch {
          toast.warning('Pet updated but some images failed to upload');
        }
        setIsUploading(false);
      }

      toast.success('Pet listing updated successfully');
      router.push('/my-pets');
    } catch {
      toast.error('Failed to update pet listing');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'shelter') {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Only shelter accounts can edit pet listings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Pet Listing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update the details for {pet?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><Info className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Pet Name <span className="text-destructive">*</span></Label>
                <Input id="name" {...register('name', { required: 'Name is required' })}
                  className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="species">Species</Label>
                <select id="species" {...register('species')} className={SELECT_CLS}>
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
              <div className="space-y-1.5">
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" {...register('breed')} placeholder="e.g., Labrador Retriever" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Checkbox id="mixedBreed" checked={watch('mixedBreed')}
                  onCheckedChange={(v) => setValue('mixedBreed', v)} />
                <Label htmlFor="mixedBreed" className="font-normal cursor-pointer">Mixed Breed</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...register('age')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ageUnit">Age Unit</Label>
                <select id="ageUnit" {...register('ageUnit')} className={SELECT_CLS}>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Checkbox id="ageEstimated" checked={watch('ageEstimated')}
                  onCheckedChange={(v) => setValue('ageEstimated', v)} />
                <Label htmlFor="ageEstimated" className="font-normal cursor-pointer">Estimated</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                <select id="gender" {...register('gender')} className={SELECT_CLS}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="size">Size</Label>
                <select id="size" {...register('size')} className={SELECT_CLS}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra_large">Extra Large</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" step="0.1" {...register('weight')} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" {...register('color')} placeholder="e.g., Brown, Black & White" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="markings">Markings</Label>
                <Input id="markings" {...register('markings')} placeholder="e.g., White spot on chest" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><Activity className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Health Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'isVaccinated', label: 'Vaccinated' },
                { id: 'isNeutered',   label: 'Neutered' },
                { id: 'isSpayed',     label: 'Spayed' },
                { id: 'houseTrained', label: 'House Trained' },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox id={id} checked={watch(id)} onCheckedChange={(v) => setValue(id, v)} />
                  <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="healthStatus">Health Status</Label>
              <select id="healthStatus" {...register('healthStatus')} className={SELECT_CLS}>
                <option value="healthy">Healthy</option>
                <option value="recovering">Recovering</option>
                <option value="special_needs">Special Needs</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea id="medicalHistory" {...register('medicalHistory')} rows={3}
                placeholder="Past illnesses, surgeries, or ongoing treatments..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialNeeds">Special Needs</Label>
              <Textarea id="specialNeeds" {...register('specialNeeds')} rows={2}
                placeholder="Any special care requirements..." />
            </div>
          </CardContent>
        </Card>

        {/* Behaviour */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><Heart className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Behavioral Traits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'goodWithKids', label: 'Good with Kids' },
                { id: 'goodWithPets', label: 'Good with Pets' },
                { id: 'goodWithCats', label: 'Good with Cats' },
                { id: 'goodWithDogs', label: 'Good with Dogs' },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox id={id} checked={watch(id)} onCheckedChange={(v) => setValue(id, v)} />
                  <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="energyLevel">Energy Level</Label>
                <select id="energyLevel" {...register('energyLevel')} className={SELECT_CLS}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trainedLevel">Training Level</Label>
                <select id="trainedLevel" {...register('trainedLevel')} className={SELECT_CLS}>
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
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Description & Story</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" {...register('description', { required: 'Description is required' })}
                rows={5} placeholder="Describe the pet's personality, habits, and what makes them special..."
                className={errors.description ? 'border-destructive' : ''} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="story">Pet's Story</Label>
              <Textarea id="story" {...register('story')} rows={3}
                placeholder="Share the pet's background, how they came to you, etc..." />
            </div>
          </CardContent>
        </Card>

        {/* Adoption Details */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><MapPin className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Adoption Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adoptionStatus">Adoption Status</Label>
              <select id="adoptionStatus" {...register('adoptionStatus')} className={SELECT_CLS}>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="listingType">Listing Type</Label>
              <select id="listingType" {...register('listingType')} className={SELECT_CLS}>
                <option value="adopt">Adopt Only</option>
                <option value="foster">Foster Only</option>
                <option value="both">Adopt or Foster</option>
              </select>
              <p className="text-xs text-muted-foreground">Choose whether this pet is available for adoption, fostering, or both.</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="isUrgent" checked={watch('isUrgent')}
                onCheckedChange={(v) => setValue('isUrgent', v)} />
              <Label htmlFor="isUrgent" className="font-normal cursor-pointer">Mark as Urgent Adoption</Label>
            </div>

            {watchIsUrgent && (
              <div className="space-y-1.5 p-3 bg-destructive/5 rounded-lg border border-destructive/30">
                <Label htmlFor="urgentReason">Urgent Reason <span className="text-destructive">*</span></Label>
                <Textarea id="urgentReason" {...register('urgentReason')} rows={2}
                  placeholder="Explain why this adoption is urgent..." />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vet Records */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10"><Stethoscope className="h-4 w-4 text-primary" /></div>
                <CardTitle className="text-base">Health Records</CardTitle>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowAddRecord((v) => !v)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add record inline form */}
            {showAddRecord && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-semibold">New Health Record</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={newRecord.date}
                      onChange={(e) => setNewRecord((r) => ({ ...r, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <select value={newRecord.type}
                      onChange={(e) => setNewRecord((r) => ({ ...r, type: e.target.value }))}
                      className={SELECT_CLS}>
                      <option value="vaccination">Vaccination</option>
                      <option value="checkup">Checkup</option>
                      <option value="treatment">Treatment</option>
                      <option value="surgery">Surgery</option>
                      <option value="dental">Dental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name / Vaccine <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g., Rabies vaccine" value={newRecord.name}
                      onChange={(e) => setNewRecord((r) => ({ ...r, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vet / Clinic</Label>
                    <Input placeholder="e.g., Dr. Sharma" value={newRecord.vet}
                      onChange={(e) => setNewRecord((r) => ({ ...r, vet: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Notes</Label>
                    <Input placeholder="Any additional notes" value={newRecord.notes}
                      onChange={(e) => setNewRecord((r) => ({ ...r, notes: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRecord(false)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={addVetRecord}>Save Record</Button>
                </div>
              </div>
            )}

            {/* Records list */}
            {vetRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No health records added yet. Click "Add Record" to start.
              </p>
            ) : (
              <div className="space-y-2">
                {vetRecords.map((rec) => (
                  <div key={rec.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{rec.name}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize">{rec.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rec.date}{rec.vet ? ` · ${rec.vet}` : ''}
                      </p>
                      {rec.notes && <p className="text-xs text-muted-foreground mt-0.5">{rec.notes}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removeVetRecord(rec.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><ImageIcon className="h-4 w-4 text-primary" /></div>
              <CardTitle className="text-base">Pet Images</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={img.url || img} alt="Pet" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(img.id)}
                        disabled={deletingImageId === img.id}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-60"
                      >
                        {deletingImageId === img.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <X className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new images */}
            <div>
              <Label htmlFor="images" className="text-sm font-medium">Add More Images</Label>
              <Input id="images" type="file" accept="image/*" multiple onChange={handleFileSelect}
                className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP. Max 10MB per image.</p>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={url} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading Images...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
