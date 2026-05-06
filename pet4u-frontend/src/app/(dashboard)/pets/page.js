'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPets } from '@/lib/store/slices/petSlice';
import PetGrid from '@/app/_component/pets/PetGrid';
import PetFilter from '@/app/_component/pets/PetFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Bell, BellOff } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { savedSearchesAPI } from '@/lib/api/savedSearches';

export default function PetsPage() {
  const dispatch = useDispatch();
  const { pets, pagination, filters, isLoading, error } = useSelector((state) => state.pets);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Save alert dialog state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertName, setAlertName] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);

  useEffect(() => {
    loadPets();
  }, [currentPage]);

  const loadPets = () => {
    dispatch(fetchPets({
      ...filters,
      page: currentPage,
      limit: 12,
    }));
  };

  const handleFilterApply = (newFilters) => {
    setCurrentPage(1);
    setFilterOpen(false);
    setActiveFilters(newFilters);
    dispatch(fetchPets({
      ...newFilters,
      page: 1,
      limit: 12,
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && !['sortBy', 'order'].includes(key)
  ).length;

  const hasFilters = activeFilterCount > 0;

  const openAlertDialog = () => {
    // Pre-fill name from current filters
    const parts = [];
    if (filters.species) parts.push(filters.species);
    if (filters.breed) parts.push(filters.breed);
    if (filters.city) parts.push(`in ${filters.city}`);
    else if (filters.state) parts.push(`in ${filters.state}`);
    setAlertName(parts.length > 0 ? parts.join(' ') : 'My pet search');
    setAlertDialogOpen(true);
  };

  const handleSaveAlert = async () => {
    if (!alertName.trim()) {
      toast.error('Please enter an alert name');
      return;
    }
    setSavingAlert(true);
    try {
      const payload = {
        name: alertName.trim(),
        species: filters.species || undefined,
        breed: filters.breed || undefined,
        gender: filters.gender || undefined,
        size: filters.size || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        minAge: filters.minAge || undefined,
        maxAge: filters.maxAge || undefined,
      };
      await savedSearchesAPI.createAlert(payload);
      toast.success('Alert saved! You\'ll be notified when new pets match your search.');
      setAlertDialogOpen(false);
      setAlertName('');
    } catch {
      toast.error('Failed to save alert');
    } finally {
      setSavingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find Your Perfect Pet</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse through our available pets and find your new companion
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Alert Button - only for adopters with active filters */}
          {user?.role === 'adopter' && hasFilters && (
            <Button
              variant="outline"
              className="border-2 border-primary/40 text-primary hover:bg-primary/5 gap-2"
              onClick={openAlertDialog}
            >
              <Bell className="h-4 w-4" />
              Save Alert
            </Button>
          )}

          {/* Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-2 relative h-10">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  Filter Pets
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFilterCount} active
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect pet
                </SheetDescription>
              </SheetHeader>
              <PetFilter onApplyFilters={handleFilterApply} isInSheet={true} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {!isLoading && pets.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pets.length}</span> of{' '}
              <span className="font-medium text-foreground">{pagination.totalCount}</span> pets
            </p>
            {user?.role === 'adopter' && hasFilters && (
              <button
                onClick={openAlertDialog}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Bell className="h-3 w-3" />
                Get notified for new matches
              </button>
            )}
          </div>
        )}

        <PetGrid pets={pets} isLoading={isLoading} error={error} />

        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="border-2"
            >
              <ChevronLeft size={16} />
              <span className="ml-1">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[36px] h-9 ${currentPage === page ? '' : 'border-2'}`}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="border-2"
            >
              <span className="mr-1">Next</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Save Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Save Pet Alert
            </DialogTitle>
            <DialogDescription>
              Get notified when new pets matching your current filters become available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Active filters summary */}
            <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Alert criteria</p>
              <div className="flex flex-wrap gap-1.5">
                {filters.species && <Badge variant="secondary" className="text-xs">{filters.species}</Badge>}
                {filters.breed && <Badge variant="secondary" className="text-xs">{filters.breed}</Badge>}
                {filters.gender && <Badge variant="secondary" className="text-xs">{filters.gender}</Badge>}
                {filters.size && <Badge variant="secondary" className="text-xs">{filters.size}</Badge>}
                {filters.city && <Badge variant="secondary" className="text-xs">{filters.city}</Badge>}
                {filters.state && <Badge variant="secondary" className="text-xs">{filters.state}</Badge>}
                {!hasFilters && <span className="text-xs text-muted-foreground">All pets (no filters applied)</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alertName">Alert name</Label>
              <Input
                id="alertName"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                placeholder="e.g. Golden Retriever in Mumbai"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAlert()}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setAlertDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveAlert} disabled={savingAlert}>
                {savingAlert ? 'Saving...' : 'Save Alert'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
