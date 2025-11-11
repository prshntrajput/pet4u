// app/_component/providers/AuthInitializer.jsx
'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken } from '@/lib/store/slices/authSlice';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only verify token once on app mount if user appears authenticated
    if (!hasInitialized.current && isAuthenticated) {
      hasInitialized.current = true;
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated]);

  return children;
}
