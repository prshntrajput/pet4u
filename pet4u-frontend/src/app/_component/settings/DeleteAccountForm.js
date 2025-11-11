'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deleteAccountSchema } from '@/lib/validations/userSchema';
import { userAPI } from '@/lib/api/user';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { logoutUser } from '@/lib/store/slices/authSlice';

export default function DeleteAccountForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      confirmation: '',
    },
  });

  const onSubmit = async (data) => {
    setIsDeleting(true);
    
    try {
      const response = await userAPI.deleteAccount({
        password: data.password,
        confirmation: data.confirmation,
      });
      
      if (response.success) {
        toast.success('Account deleted successfully');
        
        // Logout and redirect
        await dispatch(logoutUser()).unwrap();
        router.push('/');
      } else {
        toast.error(response.error || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('An error occurred while deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Warning Message */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-900">
              Account Deletion Warning
            </h4>
            <div className="text-sm text-red-700 mt-2 space-y-1">
              <p>Deleting your account is permanent and cannot be undone. This action will:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Delete all your personal information</li>
                <li>Remove all your favorite pets</li>
                <li>Cancel all pending adoption requests</li>
                <li>Delete all your messages and conversations</li>
                {/* Add shelter-specific warnings if needed */}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button with Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full md:w-auto">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Please confirm you want to permanently delete your account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Enter Your Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    disabled={isDeleting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirmation Text */}
              <div className="space-y-2">
                <Label htmlFor="confirmation">
                  Type <span className="font-bold">DELETE MY ACCOUNT</span> to confirm
                </Label>
                <Input
                  id="confirmation"
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  {...register('confirmation')}
                  className={errors.confirmation ? 'border-red-500' : ''}
                  disabled={isDeleting}
                />
                {errors.confirmation && (
                  <p className="text-sm text-red-500">{errors.confirmation.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
