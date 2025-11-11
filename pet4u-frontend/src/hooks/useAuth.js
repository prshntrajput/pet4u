'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export function useAuth(options = {}) {
  const { requireAuth = false, requireGuest = false, redirectTo } = options;
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoading) return;

    if (requireGuest && isAuthenticated) {
      const redirect = redirectTo || '/dashboard';
      router.push(redirect);
    }

    if (requireAuth && !isAuthenticated) {
      const redirect = redirectTo || '/login';
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, requireAuth, requireGuest, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
