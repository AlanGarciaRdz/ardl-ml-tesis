import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading, isRegistrationComplete } = useAuth();
  const location = useLocation();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. LOGGED IN BUT REGISTRATION INCOMPLETE: Redirect to Registration Form
  if (!isRegistrationComplete) {
    // The user MUST complete registration before accessing the dashboard
    return <Navigate to="/complete-registration" replace />;
  }

  // User is logged in and registration is complete
  return <>{children}</>;
}