'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPets } from '@/lib/store/slices/petSlice';
import PetGrid from '@/app/_component/pets/PetGrid';
import PetFilter from '@/app/_component/pets/PetFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PetsPage() {
  const dispatch = useDispatch();
  const { pets, pagination, filters, isLoading, error } = useSelector((state) => state.pets);
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
        <p className="text-gray-600 mt-2">
          Browse through our available pets and find your new companion
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <PetFilter onApplyFilters={handleFilterApply} />
        </div>

        {/* Pet Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Count */}
          {!isLoading && pets.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {pets.length} of {pagination.totalCount} pets
            </div>
          )}

          {/* Grid */}
          <PetGrid pets={pets} isLoading={isLoading} error={error} />

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft size={18} />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {/* Show ellipsis if there's a gap */}
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-[40px]"
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
              >
                Next
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
