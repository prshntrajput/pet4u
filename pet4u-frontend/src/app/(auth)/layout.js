'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function AuthLayout({ children }) {
  // Redirect authenticated users to dashboard
  useAuth({ requireGuest: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Logo/Brand */}
         

          {/* Auth Form */}
          <div className="w-full max-w-2xl">
            {children}
          </div>

          {/* Footer */}
          
        </div>
      </div>
    </div>
  );
}
