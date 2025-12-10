'use client';

import { useEffect, useState } from 'react';
import { searchAPI } from '@/lib/api/search';
import PetCard from '../../../app/_component/pets/PetCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Filter, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedSearchPage() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Search filters
  const [filters, setFilters] = useState({
    search: '',
    species: '',
    gender: '',
    size: '',
    city: '',
    state: '',
    minAge: 0,
    maxAge: 120,
    ageUnit: 'months',
    isVaccinated: undefined,
    isNeutered: undefined,
    goodWithKids: undefined,
    goodWithPets: undefined,
    energyLevel: '',
    minFee: 0,
    maxFee: 50000,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await searchAPI.advancedSearch({
        ...cleanFilters,
        page,
        limit: 12,
      });

      if (response.success) {
        setPets(response.data.data.pets);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      species: '',
      gender: '',
      size: '',
      city: '',
      state: '',
      minAge: 0,
      maxAge: 120,
      ageUnit: 'months',
      isVaccinated: undefined,
      isNeutered: undefined,
      goodWithKids: undefined,
      goodWithPets: undefined,
      energyLevel: '',
      minFee: 0,
      maxFee: 50000,
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'order' || key === 'minAge' || key === 'minFee') return false;
    return value !== '' && value !== undefined && value !== null;
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Advanced Search</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Find your perfect pet with detailed filters
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-2"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide' : 'Show'} Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-2">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Filters</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>

                {/* Search Query */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Search</Label>
                  <Input
                    type="text"
                    placeholder="Name, breed..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="h-9 border-2"
                  />
                </div>

                {/* Species */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Species</Label>
                  <select
                    value={filters.species}
                    onChange={(e) => handleFilterChange('species', e.target.value)}
                    className="flex h-9 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">All Species</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="hamster">Hamster</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Gender</Label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="flex h-9 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Size</Label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="flex h-9 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Any Size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra_large">Extra Large</option>
                  </select>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Age Range ({filters.ageUnit})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAge}
                      onChange={(e) => handleFilterChange('minAge', e.target.value)}
                      className="h-9 border-2"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAge}
                      onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                      className="h-9 border-2"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Location</Label>
                  <Input
                    type="text"
                    placeholder="City"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="h-9 border-2"
                  />
                  <Input
                    type="text"
                    placeholder="State"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="h-9 border-2"
                  />
                </div>

                {/* Health Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Health</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vaccinated"
                        checked={filters.isVaccinated === 'true'}
                        onCheckedChange={(checked) => 
                          handleFilterChange('isVaccinated', checked ? 'true' : undefined)
                        }
                      />
                      <label htmlFor="vaccinated" className="text-sm cursor-pointer">
                        Vaccinated
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="neutered"
                        checked={filters.isNeutered === 'true'}
                        onCheckedChange={(checked) => 
                          handleFilterChange('isNeutered', checked ? 'true' : undefined)
                        }
                      />
                      <label htmlFor="neutered" className="text-sm cursor-pointer">
                        Neutered/Spayed
                      </label>
                    </div>
                  </div>
                </div>

                {/* Behavior Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Good With</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="goodWithKids"
                        checked={filters.goodWithKids === 'true'}
                        onCheckedChange={(checked) => 
                          handleFilterChange('goodWithKids', checked ? 'true' : undefined)
                        }
                      />
                      <label htmlFor="goodWithKids" className="text-sm cursor-pointer">
                        Kids
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="goodWithPets"
                        checked={filters.goodWithPets === 'true'}
                        onCheckedChange={(checked) => 
                          handleFilterChange('goodWithPets', checked ? 'true' : undefined)
                        }
                      />
                      <label htmlFor="goodWithPets" className="text-sm cursor-pointer">
                        Other Pets
                      </label>
                    </div>
                  </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Energy Level</Label>
                  <select
                    value={filters.energyLevel}
                    onChange={(e) => handleFilterChange('energyLevel', e.target.value)}
                    className="flex h-9 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Any</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Search Button */}
                <Button
                  onClick={() => handleSearch(1)}
                  className="w-full h-10 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Pets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {isLoading && pets.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <Search className="h-24 w-24 text-primary/20" />
                  </div>
                  <Search className="h-24 w-24 text-muted-foreground relative" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No pets found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Found {pagination.totalCount} pet{pagination.totalCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="border-2"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 rounded-lg bg-muted text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handleSearch(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="border-2"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
