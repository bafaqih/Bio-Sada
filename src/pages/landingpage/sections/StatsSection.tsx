import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Recycle, Users, Handshake, BarChart3 } from 'lucide-react';
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

  return (
    <section id="statistik" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <BarChart3 className="h-3.5 w-3.5" />
              Statistik Real-time
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dampak Nyata <span className="text-emerald-600">Bio-Sada</span>
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Kontribusi nyata komunitas dalam menjaga ekosistem melalui pengelolaan sampah yang cerdas.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-emerald-100/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-md shadow-emerald-500/10 mb-5 transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                
                <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  <AnimatedCounter target={stats?.[stat.key] ?? 0} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-500 group-hover:text-emerald-600 transition-colors">
                  {stat.label}
                </p>

                <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  Verified
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
