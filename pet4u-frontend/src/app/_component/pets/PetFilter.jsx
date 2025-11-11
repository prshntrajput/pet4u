'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '@/lib/store/slices/petSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

export default function PetFilter({ onApplyFilters }) {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.pets);

  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    dispatch(setFilters(localFilters));
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      species: '',
      gender: '',
      size: '',
      city: '',
      state: '',
      sortBy: 'createdAt',
      order: 'desc',
    };
    setLocalFilters(clearedFilters);
    dispatch(clearFilters());
    if (onApplyFilters) {
      onApplyFilters(clearedFilters);
    }
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full"
      >
        <Filter size={18} className="mr-2" />
        Filters
      </Button>

      {/* Filter Panel */}
      <Card className={`${isOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700"
            >
              <X size={18} className="mr-1" />
              Clear
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name, breed..."
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>

          {/* Species */}
          <div className="space-y-2">
            <Label htmlFor="species">Species</Label>
            <select
              id="species"
              value={localFilters.species}
              onChange={(e) => handleChange('species', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={localFilters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <select
              id="size"
              value={localFilters.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sizes</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra_large">Extra Large</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Mumbai"
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              type="text"
              placeholder="e.g., Maharashtra"
              value={localFilters.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </div>

          {/* Apply Button */}
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
