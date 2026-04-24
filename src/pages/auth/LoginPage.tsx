import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft, Recycle, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email on mount & Check verification
  useEffect(() => {
    // Local Storage Check
    const savedEmail = localStorage.getItem('bioSada_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Email Verified Toast Injection
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      toast.success('Akun berhasil terverifikasi, silakan masuk', { id: 'verified-toast' });
      // Clean up URL to prevent repeat toasts on manual refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search]);

  // Handler submit login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi sederhana
    if (!email.trim() || !password.trim()) {
      toast.error('Email dan kata sandi wajib diisi.');
      return;
    }

    setSedangMemuat(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSedangMemuat(false);

    if (error) {
      toast.error('Gagal masuk: ' + error.message);
      return;
    }

    // Save or clear remember me email
    if (rememberMe) {
      localStorage.setItem('bioSada_saved_email', email.trim());
    } else {
      localStorage.removeItem('bioSada_saved_email');
    }

    toast.success('Berhasil masuk! Mengarahkan ke dashboard...');
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <Helmet>
        <title>Masuk | Bio-Sada</title>
      </Helmet>
      {/* Dekorasi latar belakang */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/20 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-emerald-100/60 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
          <CardHeader className="items-center text-center">
            {/* Logo / Ikon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
            >
              <Recycle className="h-8 w-8 text-white" />
            </motion.div>

            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              Masuk ke Bio-Sada
            </CardTitle>
            <CardDescription className="text-gray-500">
              Masukkan email dan kata sandi Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Field Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                />
              </div>

              {/* Field Kata Sandi */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-password" className="text-gray-700">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={tampilkanPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 border-gray-200 bg-white/70 pr-11 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    aria-label={tampilkanPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setTampilkanPassword(!tampilkanPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                  >
                    {tampilkanPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Link Lupa Kata Sandi & Ingat Saya */}
              <div className="flex items-center justify-between">
                <label className="group flex cursor-pointer items-center gap-2">
                  <div className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded outline-none transition-all">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    {/* Kotak Custom */}
                    <div
                      className={`pointer-events-none absolute inset-0 rounded transition-all duration-200 ${
                        rememberMe
                          ? 'border-transparent bg-linear-to-r from-emerald-500 to-teal-600'
                          : 'border border-gray-300 bg-white group-hover:border-emerald-400'
                      }`}
                    />
                    {/* Centang SVG */}
                    {rememberMe && (
                      <svg
                        className="pointer-events-none relative z-10 h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm tracking-tight text-gray-600">Ingat Saya</span>
                </label>
                <Link
                  to="/password/reset"
                  id="link-lupa-password"
                  className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Tombol Masuk */}
              <Button
                type="submit"
                id="btn-login"
                disabled={sedangMemuat}
                size="lg"
                className="h-12 w-full bg-linear-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
              >
                {sedangMemuat ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400">atau</span>
              </div>
            </div>

            {/* Link ke Daftar Akun */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  id="link-daftar"
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

            {/* Tombol Kembali ke Beranda */}
            <div className="mt-4 text-center">
              <Link
                to="/"
                id="link-beranda"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-emerald-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Bio-Sada. Platform Bank Sampah Digital.
        </p>
      </motion.div>
    </div>
  );
}
