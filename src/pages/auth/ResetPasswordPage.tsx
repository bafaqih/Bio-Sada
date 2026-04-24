import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Loader2, Mail } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isEmailSent && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isEmailSent, countdown]);

  const handleReset = async (e: FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error('Email wajib diisi.');
      return;
    }

    setSedangMemuat(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/password/new`,
    });

    setSedangMemuat(false);

    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        toast.error('Email tidak terdaftar di sistem kami.');
      } else {
        toast.error('Gagal mengirim link reset: ' + error.message);
      }
      return;
    }

    toast.success('Link reset kata sandi berhasil dikirim!');
    setIsEmailSent(true);
    setCountdown(60);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <Helmet>
        <title>Reset Kata Sandi | Bio-Sada</title>
      </Helmet>
      {/* Dekorasi latar belakang (Sama seperti halaman auth lainnya) */}
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
          {!isEmailSent ? (
            <CardHeader className="items-center text-center">
              {/* Ikon Lupa Password */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
              >
                <KeyRound className="h-8 w-8 text-white" />
              </motion.div>

              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                Lupa Kata Sandi
              </CardTitle>
              <CardDescription className="text-gray-500">
                Masukkan email Anda yang terdaftar untuk mengatur ulang kata sandi
              </CardDescription>
            </CardHeader>
          ) : null}

          <CardContent className={isEmailSent ? 'pt-6' : ''}>
            {isEmailSent ? (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-2 text-center"
               >
                 <div className="absolute top-4 left-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     className="text-gray-500 hover:text-gray-700"
                     onClick={() => setIsEmailSent(false)}
                   >
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Kembali
                   </Button>
                 </div>
                 
                 <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mt-6">
                   <Mail className="h-10 w-10 text-emerald-600" />
                 </div>
                 <h3 className="mb-2 text-xl font-bold text-gray-900">Periksa Email Anda</h3>
                 <p className="mb-6 text-center text-sm text-gray-500 max-w-sm">
                   Kami telah mengirimkan tautan reset kata sandi ke email <strong className="text-gray-800">{email}</strong>. 
                   Silakan periksa kotak masuk atau folder spam Anda.
                 </p>
                 
                 <Button
                   type="button"
                   onClick={handleReset}
                   disabled={countdown > 0 || sedangMemuat}
                   variant="outline"
                   className="w-full sm:w-auto"
                 >
                   {countdown > 0 ? (
                     `Kirim Ulang (${countdown}s)`
                   ) : sedangMemuat ? (
                     <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                   ) : (
                     'Kirim Ulang Link Reset'
                   )}
                 </Button>
               </motion.div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                {/* Field Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reset-email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-4">
                  {/* Tombol Reset */}
                  <Button
                    type="submit"
                    disabled={sedangMemuat}
                    size="lg"
                    className="h-12 w-full bg-linear-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
                  >
                    {sedangMemuat ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mengirim Link...
                      </>
                    ) : (
                      'Kirim Link Reset'
                    )}
                  </Button>

                  {/* Tombol Kembali ke Login */}
                  <div className="text-center mt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Masuk
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
