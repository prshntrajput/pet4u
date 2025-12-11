// components/LoadingOverlay.js
'use client';

import { useEffect, useState } from 'react';

export default function LoadingOverlay({ isLoading }) {
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSlowWarning(true);
      }, 5000); // Show warning after 5 seconds

      return () => clearTimeout(timer);
    } else {
      setShowSlowWarning(false);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {showSlowWarning ? 'Waking up server...' : 'Loading...'}
        </h3>
        {showSlowWarning && (
          <p className="text-sm text-muted-foreground">
            First request may take up to 30 seconds on free tier. Thanks for your patience! 🙏
          </p>
        )}
      </div>
    </div>
  );
}
