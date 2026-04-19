import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2, Recycle } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import NewPasswordPage from '@/pages/auth/NewPasswordPage';

// Dashboard infrastructure
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';

// Nasabah pages
import WasteListPage from '@/pages/dashboard/nasabah/WasteListPage';
import DepositRequestPage from '@/pages/dashboard/nasabah/DepositRequestPage';
import DepositHistoryPage from '@/pages/dashboard/nasabah/DepositHistoryPage';
import ProfilePage from '@/pages/dashboard/nasabah/ProfilePage';

// Mitra pages
import ActiveTasksPage from '@/pages/dashboard/mitra/ActiveTasksPage';
import TaskDetailPage from '@/pages/dashboard/mitra/TaskDetailPage';
import TaskHistoryPage from '@/pages/dashboard/mitra/TaskHistoryPage';

// Admin pages
import AdminWasteListPage from '@/pages/dashboard/admin/AdminWasteListPage';
import PartnerManagementPage from '@/pages/dashboard/admin/PartnerManagementPage';
import PartnerDetailPage from '@/pages/dashboard/admin/PartnerDetailPage';
import CustomerManagementPage from '@/pages/dashboard/admin/CustomerManagementPage';
import CustomerDetailPage from '@/pages/dashboard/admin/CustomerDetailPage';
import TransactionLogsPage from '@/pages/dashboard/admin/TransactionLogsPage';
import TransactionDetailPage from '@/pages/dashboard/admin/TransactionDetailPage';

// ── Query Client ─────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// ── Temporary landing page (will be replaced later) ─────────

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10">
      <h1 className="text-3xl font-bold text-gray-900">Landing Page Bio-Sada</h1>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Masuk
        </a>
        <a
          href="/register"
          className="rounded-xl border-2 border-emerald-600 px-6 py-2.5 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
        >
          Daftar
        </a>
      </div>
    </div>
  );
}

// ── Full-screen loading state while auth initializes ────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
        <Recycle className="h-8 w-8 text-white" />
      </div>
      <div className="flex items-center gap-2 text-emerald-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Memuat aplikasi...</span>
      </div>
    </div>
  );
}

// ── 404 page ────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10 text-center">
      <div>
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-2 text-lg text-gray-500">Halaman tidak ditemukan!</p>
        <a href="/" className="mt-4 inline-block text-emerald-600 underline hover:text-emerald-700">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

// ── Role-aware waste list wrapper ────────────────────────────

function WasteListRouteWrapper() {
  const { profile } = useAuthStore();
  return profile?.role === 'admin' ? <AdminWasteListPage /> : <WasteListPage />;
}

// ── Main App ────────────────────────────────────────────────

function AppRoutes() {
  const { isInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [initializeAuth]);

  // Show loading screen while auth state is being checked
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster position="top-center" richColors />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route path="/password/new" element={<NewPasswordPage />} />

        {/* Protected dashboard routes — all authenticated roles */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'partners', 'customers']} />}>
          <Route element={<DashboardLayout />}>
            {/* Shared dashboard home (shows role-specific content) */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Shared routes (accessible by all roles) */}
            <Route path="/dashboard/waste-list" element={<WasteListRouteWrapper />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

            {/* Customer-specific routes */}
            <Route path="/dashboard/deposit/request" element={<DepositRequestPage />} />
            <Route path="/dashboard/deposit/history" element={<DepositHistoryPage />} />

            {/* Partner-specific routes */}
            <Route path="/dashboard/task/active" element={<ActiveTasksPage />} />
            <Route path="/dashboard/task/history" element={<TaskHistoryPage />} />
            <Route path="/dashboard/task/:id" element={<TaskDetailPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/management/partner" element={<PartnerManagementPage />} />
            <Route path="/dashboard/management/partner/:id" element={<PartnerDetailPage />} />
            <Route path="/dashboard/management/customer" element={<CustomerManagementPage />} />
            <Route path="/dashboard/management/customer/:id" element={<CustomerDetailPage />} />
            <Route path="/dashboard/transaction" element={<TransactionLogsPage />} />
            <Route path="/dashboard/transaction/:id" element={<TransactionDetailPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;