'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '@/lib/store/slices/petSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from 'lucide-react';

export default function PetFilter({ onApplyFilters, isInSheet = false }) {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.pets);

  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    // ✅ Convert "all" back to empty string for API
    const finalValue = value === 'all' ? '' : value;
    setLocalFilters((prev) => ({
      ...prev,
      [field]: finalValue
    }));
  };

  const handleApply = () => {
    dispatch(setFilters(localFilters));
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
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

  // Count active filters
  const activeFilterCount = Object.entries(localFilters).filter(
    ([key, value]) => value && !['sortBy', 'order'].includes(key)
  ).length;

  return (
    <div className="relative">
      {/* Desktop - Always visible */}
      <Card className={`${isInSheet ? '' : 'hidden lg:block'} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </CardTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
              >
                <X size={14} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Name, breed..."
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Species */}
          <div className="space-y-2">
            <Label htmlFor="species" className="text-sm font-medium">Species</Label>
            <Select
              value={localFilters.species || 'all'} // ✅ Use 'all' instead of empty string
              onValueChange={(value) => handleChange('species', value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="dog">🐕 Dog</SelectItem>
                <SelectItem value="cat">🐈 Cat</SelectItem>
                <SelectItem value="bird">🐦 Bird</SelectItem>
                <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                <SelectItem value="hamster">🐹 Hamster</SelectItem>
                <SelectItem value="other">🐾 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
            <Select
              value={localFilters.gender || 'all'} // ✅ Use 'all' instead of empty string
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm font-medium">Size</Label>
            <Select
              value={localFilters.size || 'all'} // ✅ Use 'all' instead of empty string
              onValueChange={(value) => handleChange('size', value)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra_large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Mumbai"
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">State</Label>
            <Input
              id="state"
              type="text"
              placeholder="e.g., Maharashtra"
              value={localFilters.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Apply Button */}
          <Button onClick={handleApply} className="w-full" size="sm">
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
