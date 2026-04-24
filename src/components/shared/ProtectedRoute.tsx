import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/lib/types';
import LoadingScreen from '@/components/shared/LoadingScreen';

interface ProtectedRouteProps {
  /** Roles allowed to access this route. If empty/undefined, any logged-in user is allowed. */
  allowedRoles?: UserRole[];
}

/**
 * Route guard component that checks authentication and role-based access.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, isInitialized, isFetchingProfile, logout } = useAuthStore();

  // Handle auto-logout if session exists but profile is truly missing after initialization & fetch
  useEffect(() => {
    if (isInitialized && session && !profile && !isFetchingProfile) {
      console.warn('[ProtectedRoute] Session active but profile missing. Forcing logout.');
      logout();
    }
  }, [isInitialized, session, profile, isFetchingProfile, logout]);

  // 1. Still initializing auth state
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // 2. No session -> redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Session exists but profile is still loading
  if (isFetchingProfile || !profile) {
    return <LoadingScreen />;
  }

  // Role check: if allowedRoles is provided, verify user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
