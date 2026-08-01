'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loginDemoUser } from '@/lib/store/slices/authSlice';
import { Button } from '@/components/ui/button';

export default function DemoLoginButton({ className = '', size, variant = 'outline' }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading } = useSelector((state) => state.auth);

  const handleDemoLogin = async () => {
    try {
      await dispatch(loginDemoUser()).unwrap();
      toast.success('Demo mode started', {
        description: 'You can explore the platform in read-only mode.',
      });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Unable to start demo mode', {
        description: error || 'Please try again.',
      });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleDemoLogin}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
      {isLoading ? 'Starting demo...' : 'Try demo'}
    </Button>
  );
}
