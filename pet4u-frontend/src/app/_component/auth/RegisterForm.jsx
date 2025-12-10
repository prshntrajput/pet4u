'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations/authSchema';
import { registerUser, clearRegistrationSuccess, clearError } from '@/lib/store/slices/authSlice';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Loader2, PawPrint, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { isLoading, error, registrationSuccess } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'adopter',
      phone: '',
      agreeToTerms: false,
    },
  });

  const watchRole = watch('role');
  const watchPassword = watch('password');

  // Handle successful registration
  useEffect(() => {
    if (registrationSuccess) {
      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account.',
      });
      
      setTimeout(() => {
        dispatch(clearRegistrationSuccess());
        router.push('/login');
      }, 2000);
    }
  }, [registrationSuccess, dispatch, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
    } catch (err) {
      toast.error('Registration failed', {
        description: err || 'Please try again',
      });
    }
  };

  // Password strength checker
  const passwordChecks = {
    length: watchPassword?.length >= 8,
    uppercase: /[A-Z]/.test(watchPassword),
    lowercase: /[a-z]/.test(watchPassword),
    number: /[0-9]/.test(watchPassword),
    special: /[@$!%*?&]/.test(watchPassword),
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2">
      <CardHeader className="space-y-4 text-center">
        {/* Logo */}
        <Link href="/" className="flex justify-center">
          <div className="inline-flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-primary">Pet4u</span>
          </div>
        </Link>

        <div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription className="mt-2">
            Join Pet4u and find your perfect companion
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className={`h-10 ${errors.name ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email and Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className={`h-10 ${errors.email ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                {...register('phone')}
                className={`h-10 ${errors.phone ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                htmlFor="adopter"
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  watchRole === 'adopter' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  id="adopter"
                  value="adopter"
                  {...register('role')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <span className={`text-sm font-medium ${watchRole === 'adopter' ? 'text-primary' : ''}`}>
                  Pet Adopter
                </span>
              </label>

              <label 
                htmlFor="shelter"
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  watchRole === 'shelter' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  id="shelter"
                  value="shelter"
                  {...register('role')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <span className={`text-sm font-medium ${watchRole === 'shelter' ? 'text-primary' : ''}`}>
                  Shelter/Seller
                </span>
              </label>
            </div>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`h-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`h-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          {watchPassword && (
            <div className="p-3 bg-muted border rounded-lg space-y-2">
              <p className="text-xs font-medium mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'uppercase', label: 'Uppercase letter' },
                  { key: 'lowercase', label: 'Lowercase letter' },
                  { key: 'number', label: 'Number' },
                  { key: 'special', label: 'Special character' },
                ].map((check) => (
                  <div key={check.key} className="flex items-center gap-2">
                    <CheckCircle2 
                      size={14} 
                      className={passwordChecks[check.key] ? 'text-green-600' : 'text-muted-foreground'} 
                    />
                    <span className={`text-xs ${passwordChecks[check.key] ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2">
            <Controller
              name="agreeToTerms"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="agreeToTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="mt-1"
                />
              )}
            />
            <Label 
              htmlFor="agreeToTerms" 
              className="text-sm font-normal cursor-pointer leading-tight"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-xs text-destructive">{errors.agreeToTerms.message}</p>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Already registered?
            </span>
          </div>
        </div>

        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Sign in instead
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
