import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Halaman Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Halaman dummy sementara (akan diganti nanti)
const LandingPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10">
    <h1 className="text-3xl font-bold text-gray-900">Landing Page Bio-Sada</h1>
    <div className="flex gap-4">
      <a href="/login" className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700">
        Masuk
      </a>
      <a href="/register" className="rounded-xl border-2 border-emerald-600 px-6 py-2.5 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50">
        Daftar
      </a>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10">
    <h1 className="text-3xl font-bold text-gray-900">Dashboard Utama</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Toaster: Komponen untuk memunculkan notifikasi (success/error) */}
      <Toaster position="top-center" richColors />
      
      <Routes>
        {/* Halaman Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Halaman Dashboard (Nanti dibagi berdasarkan Role) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 404 - Halaman Tidak Ditemukan */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10 text-center">
              <div>
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="mt-2 text-lg text-gray-500">Halaman tidak ditemukan!</p>
                <a href="/" className="mt-4 inline-block text-emerald-600 underline hover:text-emerald-700">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;