import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ allowedRoles, children }) {
  const { loading, user, profile } = useAuth();
  const resolvedRole = profile?.role || user?.user_metadata?.role || user?.app_metadata?.role;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile && !resolvedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Profile Setup Pending</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your account is created but profile record was not found in database.
          </p>
          <p className="text-xs text-gray-500 mt-3">Contact college admin to complete onboarding.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && resolvedRole && !allowedRoles.includes(resolvedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
