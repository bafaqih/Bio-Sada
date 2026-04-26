import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

// Infrastructure & Layout (Static)
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingScreen from '@/components/shared/LoadingScreen';

// Auth & Public pages (Static - No loading flash)
import LandingPage from '@/pages/landingpage/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import NewPasswordPage from '@/pages/auth/NewPasswordPage';

// Dashboard pages (Lazy loaded - Loaded once when entering dashboard)
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));

// Nasabah pages
const WasteListPage = lazy(() => import('@/pages/dashboard/nasabah/WasteListPage'));
const DepositRequestPage = lazy(() => import('@/pages/dashboard/nasabah/DepositRequestPage'));
const DepositHistoryPage = lazy(() => import('@/pages/dashboard/nasabah/DepositHistoryPage'));
const DepositDetailPage = lazy(() => import('@/pages/dashboard/nasabah/DepositDetailPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/nasabah/ProfilePage'));

// Mitra pages
const ActiveTasksPage = lazy(() => import('@/pages/dashboard/mitra/ActiveTasksPage'));
const TaskDetailPage = lazy(() => import('@/pages/dashboard/mitra/TaskDetailPage'));
const TaskHistoryPage = lazy(() => import('@/pages/dashboard/mitra/TaskHistoryPage'));
const TransactionReportPage = lazy(() => import('@/pages/dashboard/mitra/TransactionReportPage'));

// Admin pages
const AdminWasteListPage = lazy(() => import('@/pages/dashboard/admin/AdminWasteListPage'));
const PartnerManagementPage = lazy(() => import('@/pages/dashboard/admin/PartnerManagementPage'));
const PartnerDetailPage = lazy(() => import('@/pages/dashboard/admin/PartnerDetailPage'));
const CustomerManagementPage = lazy(() => import('@/pages/dashboard/admin/CustomerManagementPage'));
const CustomerDetailPage = lazy(() => import('@/pages/dashboard/admin/CustomerDetailPage'));
const TransactionLogsPage = lazy(() => import('@/pages/dashboard/admin/TransactionLogsPage'));
const TransactionDetailPage = lazy(() => import('@/pages/dashboard/admin/TransactionDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));

// ── Query Client ─────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Disable auto-refresh on tab focus
    },
  },
});





// ── Role-aware waste list wrapper ────────────────────────────

function WasteListRouteWrapper() {
  const { profile } = useAuthStore();
  return profile?.role === 'admin' ? <AdminWasteListPage /> : <WasteListPage />;
}

// ── Main App ────────────────────────────────────────────────

function AppRoutes() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster position="top-center" richColors />

      <Routes>
        {/* Public routes (Static - Instant) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route path="/password/new" element={<NewPasswordPage />} />

        {/* Protected dashboard routes — Lazy loaded as a bundle with LoadingScreen */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'partners', 'customers']} />}>
          <Route element={
            <Suspense fallback={<LoadingScreen />}>
              <DashboardLayout />
            </Suspense>
          }>
            {/* Shared dashboard home */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Shared routes */}
            <Route path="/dashboard/waste-list" element={<WasteListRouteWrapper />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

            {/* Customer-specific routes */}
            <Route path="/dashboard/deposit/request" element={<DepositRequestPage />} />
            <Route path="/dashboard/deposit/history" element={<DepositHistoryPage />} />
            <Route path="/dashboard/deposit/:id" element={<DepositDetailPage />} />

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
          <Route element={
            <Suspense fallback={<LoadingScreen />}>
              <DashboardLayout />
            </Suspense>
          }>
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