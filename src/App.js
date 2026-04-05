import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import AdminDashboard from './dashboards/AdminDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function HomeRoute() {
  const { loading, user, profile, getDefaultPathByRole } = useAuth();
  const resolvedRole = profile?.role || user?.user_metadata?.role || user?.app_metadata?.role;

  if (loading) {
    return <HomePage />;
  }

  if (user && resolvedRole) {
    return <Navigate to={getDefaultPathByRole(resolvedRole)} replace />;
  }

  return <HomePage />;
}

function AuthRedirect({ children }) {
  const { loading, user, profile, getDefaultPathByRole } = useAuth();
  const resolvedRole = profile?.role || user?.user_metadata?.role || user?.app_metadata?.role;

  if (loading) return children;

  if (resolvedRole) {
    return <Navigate to={getDefaultPathByRole(resolvedRole)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <SignupPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['college_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute allowedRoles={['school_coordinator', 'teacher']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
