import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Recycle, Loader2, Eye, EyeOff } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Tipe role user sesuai database */
type UserRole = 'customers' | 'partners';

interface FormDaftar {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  password: string;
  role: UserRole;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  // State form
  const [form, setForm] = useState<FormDaftar>({
    namaLengkap: '',
    email: '',
    nomorTelepon: '',
    password: '',
    role: 'customers',
  });
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);

  // Helper untuk update field form
  const updateField = <K extends keyof FormDaftar>(field: K, value: FormDaftar[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handler submit registrasi
  const handleDaftar = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi semua field wajib
    if (!form.namaLengkap.trim()) {
      toast.error('Nama lengkap wajib diisi.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email wajib diisi.');
      return;
    }
    if (!form.nomorTelepon.trim()) {
      toast.error('Nomor telepon wajib diisi.');
      return;
    }
    if (!form.password.trim()) {
      toast.error('Kata sandi wajib diisi.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Kata sandi minimal 6 karakter.');
      return;
    }

    setSedangMemuat(true);

    // Supabase Sign Up — metadata dikirim lewat options.data
    // Trigger di database akan otomatis mengisi tabel profiles
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.namaLengkap.trim(),
          role: form.role,
          phone: form.nomorTelepon.trim(),
        },
      },
    });

    setSedangMemuat(false);

    if (error) {
      toast.error('Pendaftaran gagal: ' + error.message);
      return;
    }

    toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    navigate('/login');
  };

  /** Konfigurasi opsi role */
  const opsiRole: { value: UserRole; label: string; deskripsi: string }[] = [
    {
      value: 'customers',
      label: 'Nasabah',
      deskripsi: 'Setor sampah dan pantau saldo Anda',
    },
    {
      value: 'partners',
      label: 'Mitra Pengepul',
      deskripsi: 'Jemput sampah dari nasabah',
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      {/* Dekorasi latar belakang */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-green-100/20 blur-2xl" />
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
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
            >
              <Recycle className="h-8 w-8 text-white" />
            </motion.div>

            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              Buat Akun Bio-Sada
            </CardTitle>
            <CardDescription className="text-gray-500">
              Daftar untuk mulai mengelola sampah secara digital
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleDaftar} className="flex flex-col gap-5">
              {/* Pilih Role — Radio Button */}
              <div className="flex flex-col gap-2.5">
                <Label className="text-gray-700">Daftar Sebagai</Label>
                <div className="grid grid-cols-2 gap-3">
                  {opsiRole.map((opsi) => (
                    <label
                      key={opsi.value}
                      htmlFor={`role-${opsi.value}`}
                      className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-3.5 transition-all ${
                        form.role === opsi.value
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-sm shadow-emerald-500/10'
                          : 'border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`role-${opsi.value}`}
                        name="role"
                        value={opsi.value}
                        checked={form.role === opsi.value}
                        onChange={() => updateField('role', opsi.value)}
                        className="sr-only"
                      />
                      {/* Indikator Radio */}
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition-colors ${
                            form.role === opsi.value
                              ? 'border-emerald-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {form.role === opsi.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                            />
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            form.role === opsi.value ? 'text-emerald-700' : 'text-gray-700'
                          }`}
                        >
                          {opsi.label}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-400">{opsi.deskripsi}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Field Nama Lengkap */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-nama" className="text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-nama"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={form.namaLengkap}
                  onChange={(e) => updateField('namaLengkap', e.target.value)}
                  required
                  autoComplete="name"
                  className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                />
              </div>

              {/* Field Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-email" className="text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                />
              </div>

              {/* Field Nomor Telepon */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-telepon" className="text-gray-700">
                  Nomor Telepon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.nomorTelepon}
                  onChange={(e) => updateField('nomorTelepon', e.target.value)}
                  required
                  autoComplete="tel"
                  className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                />
              </div>

              {/* Field Kata Sandi */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="register-password" className="text-gray-700">
                  Kata Sandi <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={tampilkanPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 border-gray-200 bg-white/70 pr-11 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                  />
                  <button
                    type="button"
                    id="toggle-password-register"
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
                <p className="text-xs text-gray-400">Minimal 6 karakter</p>
              </div>

              {/* Tombol Daftar */}
              <Button
                type="submit"
                id="btn-daftar"
                disabled={sedangMemuat}
                size="lg"
                className="mt-1 h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
              >
                {sedangMemuat ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Daftar Sekarang
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

            {/* Link ke Masuk */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  id="link-masuk"
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* Tombol Kembali ke Beranda */}
            <div className="mt-4 text-center">
              <Link
                to="/"
                id="link-beranda-register"
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
