import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Recycle, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Floating animated icon component */
function FloatingIcon({ icon: Icon, className, delay }: { icon: React.ElementType; className: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 12 }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/50 bg-white/60 shadow-lg shadow-emerald-500/10 backdrop-blur-sm sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Orbiting ring animation */
function OrbitRing({ size, duration, opacity }: { size: number; duration: number; opacity: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
    >
      <div className={`h-full w-full rounded-full border border-dashed border-emerald-300/${opacity}`} />
      <div className={`absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/${opacity}`} />
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16"
    >
      {/* Background decorations — matching login page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/20 blur-2xl" />
        <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />
      </div>

      {/* Orbit rings - decorative center animation */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <OrbitRing size={340} duration={25} opacity="20" />
        <OrbitRing size={500} duration={35} opacity="15" />
        <OrbitRing size={660} duration={45} opacity="10" />
      </div>

      {/* Floating icons */}
      <FloatingIcon icon={Recycle} className="top-[18%] left-[8%] hidden sm:block" delay={0.3} />
      <FloatingIcon icon={Leaf} className="top-[22%] right-[10%] hidden sm:block" delay={0.6} />
      <FloatingIcon icon={Sparkles} className="bottom-[22%] left-[12%] hidden sm:block" delay={0.9} />

      {/* Content — centered */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm">
            <Recycle className="h-4 w-4" />
            Platform Bank Sampah Digital #1
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
        >
          Ubah Sampahmu{' '}
          <span className="bg-linear-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            Jadi Cuan!
          </span>{' '}
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            ♻️
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg"
        >
          Bio-Sada menghubungkan nasabah dengan mitra pengepul terverifikasi.
          Pilah sampahmu, request penjemputan, dan dapatkan penghasilan — semua dari genggamanmu.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link to="/register">
            <Button size="lg" className="group h-12 gap-2 bg-linear-to-r from-emerald-500 to-teal-600 px-7 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl hover:shadow-emerald-500/30">
              Mulai Sekarang
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <button
            onClick={() => document.querySelector('#tentang')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Pelajari Lebih Lanjut
          </button>
        </motion.div>
      </div>
    </section>
  );
}
