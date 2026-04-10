import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2, Recycle } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboard infrastructure
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';

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

// ── Main App ────────────────────────────────────────────────

function App() {
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

        {/* Protected dashboard routes — any authenticated role */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'partners', 'customers']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;