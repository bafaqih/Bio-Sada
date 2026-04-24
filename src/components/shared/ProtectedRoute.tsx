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
 * Wraps child routes via `<Outlet />`.
 *
 * - Auth initializing → show LoadingScreen
 * - Not logged in → redirect to /login
 * - Logged in but wrong role → redirect to /dashboard with a toast warning
 * - Authorized → render child routes
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, isInitialized } = useAuthStore();

  // Show loading screen only while auth state is being initialized for protected routes
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // User is not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Profile is not fetched yet — wait (should be quick since isInitialized is true)
  if (!profile) {
    return <LoadingScreen />;
  }

  // Role check: if allowedRoles is provided, verify user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
