// AuthWrapper.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check for token

  const isAuthRoute = window.location.pathname === "/login" || window.location.pathname === "/signup";

  // Redirect authenticated users away from login/signup to home
  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/home" replace />;
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthWrapper;
