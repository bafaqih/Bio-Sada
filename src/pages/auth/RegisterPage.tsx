import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Recycle, Loader2, Eye, EyeOff, Mail } from 'lucide-react';

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
  konfirmasiPassword: string;
  role: UserRole;
}

export default function RegisterPage() {
  // State form
  const [form, setForm] = useState<FormDaftar>({
    namaLengkap: '',
    email: '',
    nomorTelepon: '',
    password: '',
    konfirmasiPassword: '',
    role: 'customers',
  });
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [tampilkanKonfirmasi, setTampilkanKonfirmasi] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  
  // Verification State
  const [showVerificationView, setShowVerificationView] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showVerificationView && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showVerificationView, countdown]);

  // Helper untuk update field form
  const updateField = <K extends keyof FormDaftar>(field: K, value: FormDaftar[K]) => {
    if (field === 'nomorTelepon') {
      // Filter the string to remove all non-digits
      let rawVal = (value as string).replace(/\D/g, '');
      // Strip leading zero or 62 since +62 is hardcoded
      if (rawVal.startsWith('0')) rawVal = rawVal.substring(1);
      else if (rawVal.startsWith('62')) rawVal = rawVal.substring(2);
      
      setForm((prev) => ({ ...prev, [field]: rawVal }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handler kirim ulang verifikasi email
  const handleKirimUlang = async () => {
    setSedangMemuat(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: form.email.trim()
    });
    setSedangMemuat(false);

    if (error) {
      toast.error('Gagal mengirim ulang: ' + error.message);
    } else {
      toast.success('Link verifikasi berhasil dikirim ulang ke email!');
      setCountdown(60);
    }
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
    if (form.password !== form.konfirmasiPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSedangMemuat(true);

    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const generatedUsername = `user${randomSuffix}`;

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.namaLengkap.trim(),
          role: form.role,
          phone_number: `62${form.nomorTelepon.trim()}`,
          username: generatedUsername,
          is_verified: form.role !== 'partners',
        },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    setSedangMemuat(false);

    if (error) {
      toast.error('Pendaftaran gagal: ' + error.message);
      return;
    }

    // Supabase default protection: jika akun sudah ada, signUp mengembalikan success tapi dengan 'identities' kosong
    if (data?.user?.identities && data.user.identities.length === 0) {
      toast.error('Email ini sudah terdaftar! Silakan masuk ke akun Anda.');
      return;
    }

    toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    setCountdown(60);
    setShowVerificationView(true);
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
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="border-emerald-100/60 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur-sm">
          {!showVerificationView && (
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
          )}

          <CardContent>
            {showVerificationView ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="absolute top-4 left-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowVerificationView(false)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                  </Button>
                </div>
                
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <Mail className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Periksa Email Anda</h3>
                <p className="mb-6 text-center text-sm text-gray-500 max-w-sm">
                  Kami telah mengirimkan tautan verifikasi ke email <strong className="text-gray-800">{form.email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                
                <Button
                  onClick={handleKirimUlang}
                  disabled={countdown > 0 || sedangMemuat}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {countdown > 0 ? (
                    `Kirim Ulang (${countdown}s)`
                  ) : sedangMemuat ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                  ) : (
                    'Kirim Ulang Link Verifikasi'
                  )}
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleDaftar} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Pilih Role — Radio Button */}
                <div className="flex flex-col gap-2.5 md:col-span-2">
                  <Label className="text-gray-700">Daftar Sebagai</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="register-telepon" className="text-gray-700">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex h-11 w-full overflow-hidden rounded-md border border-gray-200 bg-white/70 transition-colors focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/20">
                    {/* Add-on Bendera & +62 */}
                    <div className="flex items-center gap-1.5 border-r border-gray-200 bg-gray-50 px-3 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 3 2"
                        className="h-4 w-6 shrink-0 rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                      >
                        <path fill="#fff" d="M0 0h3v2H0z"/>
                        <path fill="#ce1126" d="M0 0h3v1H0z"/>
                      </svg>
                      <span className="text-sm font-medium select-none">+62</span>
                    </div>
                    {/* Input Number Asli */}
                    <input
                      id="register-telepon"
                      type="tel"
                      placeholder="851xxxxxxxx"
                      value={form.nomorTelepon}
                      onChange={(e) => updateField('nomorTelepon', e.target.value)}
                      required
                      autoComplete="tel"
                      className="flex-1 bg-transparent px-3 py-2 text-sm outline-hidden placeholder:text-gray-400"
                    />
                  </div>
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
                </div>

                {/* Field Konfirmasi Kata Sandi */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="register-password-conf" className="text-gray-700">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password-conf"
                      type={tampilkanKonfirmasi ? 'text' : 'password'}
                      placeholder="Ulangi kata sandi"
                      value={form.konfirmasiPassword}
                      onChange={(e) => updateField('konfirmasiPassword', e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 border-gray-200 bg-white/70 pr-11 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                    />
                    <button
                      type="button"
                      id="toggle-password-conf"
                      aria-label={tampilkanKonfirmasi ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
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

                {/* Footer and Submit Area (Spans full width) */}
                <div className="md:col-span-2 pt-2">
                  {/* Tombol Daftar */}
                  <Button
                    type="submit"
                    id="btn-daftar"
                    disabled={sedangMemuat}
                    size="lg"
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
                  >
                    {sedangMemuat ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mendaftarkan...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Daftar Sekarang
                      </>
                    )}
                  </Button>

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
                  <div className="text-center mb-4">
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
                  <div className="text-center">
                    <Link
                      to="/"
                      id="link-beranda-register"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-emerald-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Beranda
                    </Link>
                  </div>
                </div>
              </form>
            )}
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
