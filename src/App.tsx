import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import halaman (kita akan buat filenya setelah ini)
// Untuk sementara kita buat komponen dummy dulu di bawah
const LandingPage = () => <div className="p-10"><h1>Landing Page Bio-Sada</h1><a href="/login" className="text-emerald-600 underline">Ke Login</a></div>;
const Login = () => <div className="p-10"><h1>Halaman Login</h1><a href="/dashboard" className="text-emerald-600 underline">Masuk Dashboard</a></div>;
const Dashboard = () => <div className="p-10"><h1>Dashboard Utama</h1></div>;

function App() {
  return (
    <BrowserRouter>
      {/* Toaster: Komponen untuk memunculkan notifikasi (success/error) */}
      <Toaster position="top-center" richColors />
      
      <Routes>
        {/* Halaman Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Halaman Dashboard (Nanti kita bagi berdasarkan Role) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 404 Page */}
        <Route path="*" element={<div className="p-10 text-center">Halaman tidak ditemukan!</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;