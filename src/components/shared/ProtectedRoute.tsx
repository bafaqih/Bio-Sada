import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  /** Roles allowed to access this route. If empty/undefined, any logged-in user is allowed. */
  allowedRoles?: UserRole[];
}

/**
 * Route guard component that checks authentication and role-based access.
 * Wraps child routes via `<Outlet />`.
 *
 * - Not logged in → redirect to /login
 * - Logged in but wrong role → redirect to /dashboard with a toast warning
 * - Authorized → render child routes
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile } = useAuthStore();

  // User is not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Profile is still loading or not fetched yet — wait
  if (!profile) {
    return null;
  }

  // Role check: if allowedRoles is provided, verify user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
