import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [tampilkanKonfirmasi, setTampilkanKonfirmasi] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  useEffect(() => {
    // Optionally check if user session exists because when the reset link is clicked,
    // Supabase assigns an active session through URL fragment (#access_token).
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.warning('Sesi tidak valid atau telah kedaluwarsa. Anda dapat mencoba lagi atau meminta link reset kata sandi baru.', {
          id: 'session-warning'
        });
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !konfirmasiPassword.trim()) {
      toast.error('Kata sandi wajib diisi.');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== konfirmasiPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSedangMemuat(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setSedangMemuat(false);

    if (error) {
      toast.error('Gagal memperbarui kata sandi: ' + error.message);
      return;
    }

    toast.success('Kata sandi berhasil diperbarui! Silakan masuk kembali.');
    
    // Sign out explicitly so the user is forced to log in with new password
    await supabase.auth.signOut();
    
    navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      {/* Dekorasi latar belakang */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/20 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-emerald-100/60 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
          <CardHeader className="items-center text-center">
            {/* Ikon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>

            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              Buat Kata Sandi Baru
            </CardTitle>
            <CardDescription className="text-gray-500">
              Masukkan kata sandi baru Anda. Pastikan minimal 6 karakter.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
              {/* Field Kata Sandi Baru */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-password" className="text-gray-700">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={tampilkanPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 border-gray-200 bg-white/70 pr-11 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                  />
                  <button
                    type="button"
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

              {/* Field Konfirmasi Kata Sandi Baru */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-new-password" className="text-gray-700">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={tampilkanKonfirmasi ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru"
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 border-gray-200 bg-white/70 pr-11 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                  />
                  <button
                    type="button"
                    aria-label={tampilkanKonfirmasi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setTampilkanKonfirmasi(!tampilkanKonfirmasi)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                  >
                    {tampilkanKonfirmasi ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                {/* Tombol Konfirmasi */}
                <Button
                  type="submit"
                  disabled={sedangMemuat}
                  size="lg"
                  className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
                >
                  {sedangMemuat ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    'Konfirmasi Kata Sandi Baru'
                  )}
                </Button>
              </div>
            </form>
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
