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

  // Profile is not fetched yet
  if (!profile) {
    // If we've already initialized and have a session, but still no profile,
    // it might be a data fetch error. Show a more helpful state than just a spinner.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
        <LoadingScreen />
        <div className="max-w-xs animate-in fade-in duration-700 slide-in-from-bottom-4">
          <p className="text-sm text-gray-500">
            Mengambil data profil... Jika ini berlangsung lama, silakan coba segarkan halaman.
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
            >
              Segarkan Halaman
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-4"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role check: if allowedRoles is provided, verify user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
