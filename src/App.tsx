import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import NewPasswordPage from '@/pages/auth/NewPasswordPage';
import LandingPage from '@/pages/landingpage/LandingPage';

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
import TransactionReportPage from '@/pages/dashboard/mitra/TransactionReportPage';

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

            {/* Partner report routes */}
            <Route path="/dashboard/report/transaction" element={<TransactionReportPage />} />
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