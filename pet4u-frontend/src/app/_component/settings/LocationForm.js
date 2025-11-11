'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateLocationSchema } from '@/lib/validations/userSchema';
import { userAPI } from '@/lib/api/user';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Save } from 'lucide-react';

export default function LocationForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || 'India',
      zipCode: user?.zipCode || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India',
        zipCode: user.zipCode || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await userAPI.updateLocation(data);
      
      if (response.success) {
        toast.success('Location updated successfully!');
        
        // Update user in Redux store
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: {
            user: {
              ...user,
              ...response.data.data,
            },
            isAuthenticated: true,
          },
        });
        
        reset(data);
      } else {
        toast.error(response.error || 'Failed to update location');
      }
    } catch (error) {
      toast.error('An error occurred while updating location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Address Field */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          type="text"
          placeholder="Street address, apartment, etc."
          {...register('address')}
          className={errors.address ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* City Field */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Input
          id="city"
          type="text"
          placeholder="Mumbai"
          {...register('city')}
          className={errors.city ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.city && (
          <p className="text-sm text-red-500">{errors.city.message}</p>
        )}
      </div>

      {/* State and Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            type="text"
            placeholder="Maharashtra"
            {...register('state')}
            className={errors.state ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            type="text"
            {...register('country')}
            className={errors.country ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* ZIP Code Field */}
      <div className="space-y-2">
        <Label htmlFor="zipCode">PIN Code</Label>
        <Input
          id="zipCode"
          type="text"
          placeholder="400001"
          {...register('zipCode')}
          className={errors.zipCode ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.zipCode && (
          <p className="text-sm text-red-500">{errors.zipCode.message}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Location Privacy</p>
            <p className="text-sm text-blue-700 mt-1">
              Your exact address is never shared publicly. Only your city and state 
              are visible to help you find pets nearby.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading || !isDirty}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Location
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
