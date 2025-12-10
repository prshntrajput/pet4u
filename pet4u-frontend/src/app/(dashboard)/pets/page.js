'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPets } from '@/lib/store/slices/petSlice';
import PetGrid from '@/app/_component/pets/PetGrid';
import PetFilter from '@/app/_component/pets/PetFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';

export default function PetsPage() {
  const dispatch = useDispatch();
  const { pets, pagination, filters, isLoading, error } = useSelector((state) => state.pets);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false); // ✅ Same state for all screens

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
    setFilterOpen(false); // ✅ Close filter on apply
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

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && !['sortBy', 'order'].includes(key)
  ).length;

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

        {/* Filter Button - Works on ALL screen sizes */}
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

      {/* Main Content - Full Width, No Sidebar */}
      <div className="space-y-6">
        {/* Results Count */}
        {!isLoading && pets.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pets.length}</span> of{' '}
              <span className="font-medium text-foreground">{pagination.totalCount}</span> pets
            </p>
          </div>
        )}

        {/* Grid - Full Width */}
        <PetGrid pets={pets} isLoading={isLoading} error={error} />

        {/* Pagination */}
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
    </div>
  );
}
