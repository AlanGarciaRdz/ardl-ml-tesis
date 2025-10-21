import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationForm } from '../pages/RegistrationForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading, isRegistrationComplete } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If logged in but registration not complete, show registration form
  if (!isRegistrationComplete) {
    return (
      <RegistrationForm 
        onComplete={() => {
          // Force re-check of registration status
          window.location.reload();
        }} 
      />
    );
  }

  // User is logged in and registration is complete
  return <>{children}</>;
}