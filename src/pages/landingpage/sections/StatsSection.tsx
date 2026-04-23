import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Recycle, Users, Handshake } from 'lucide-react';
import { useLandingStats } from '@/hooks/useLandingStats';

/** Animated counter that counts up when in view */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {new Intl.NumberFormat('id-ID').format(count)}{suffix}
    </span>
  );
}

const STATS = [
  { key: 'total_waste' as const, label: 'Total Sampah Terkumpul', suffix: '+ kg', icon: Recycle, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'total_customers' as const, label: 'Nasabah Aktif', suffix: '+', icon: Users, gradient: 'from-teal-500 to-green-600' },
  { key: 'total_partners' as const, label: 'Mitra Terverifikasi', suffix: '+', icon: Handshake, gradient: 'from-green-500 to-emerald-600' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { data: stats } = useLandingStats();

  useEffect(() => {
    if (stats) {
      console.log('Stats:', stats.total_waste, stats.total_customers, stats.total_partners);
    }
  }, [stats]);

  return (
    <section className="relative py-20 sm:py-28">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Statistik</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dampak Nyata Bio-Sada
          </h2>
          <p className="mt-3 text-gray-500">Data real-time dari platform kami.</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              className="group relative overflow-hidden rounded-2xl border border-emerald-100/60 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <p className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
                <AnimatedCounter target={stats?.[stat.key] ?? 0} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
