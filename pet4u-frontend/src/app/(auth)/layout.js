'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({ children }) {
  // Redirect authenticated users to dashboard
  useAuth({ requireGuest: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">PET4U</h1>
            <p className="text-gray-600">Find Your Perfect Companion</p>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-2xl">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 PET4U. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
