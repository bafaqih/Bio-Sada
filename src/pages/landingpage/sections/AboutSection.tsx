import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Leaf, Smartphone, Users } from 'lucide-react';

const VALUES = [
  { icon: Shield, title: 'Transparansi', desc: 'Harga sampah ditampilkan secara real-time dan transparan untuk setiap transaksi.', color: 'emerald' },
  { icon: Leaf, title: 'Keberlanjutan', desc: 'Mendukung pengelolaan sampah yang ramah lingkungan dan berkelanjutan.', color: 'teal' },
  { icon: Smartphone, title: 'Kemudahan', desc: 'Proses setoran sampah yang mudah, cukup dari smartphone Anda.', color: 'green' },
  { icon: Users, title: 'Komunitas', desc: 'Membangun jaringan nasabah dan mitra pengepul yang saling menguntungkan.', color: 'emerald' },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-100/60' },
  teal: { bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-100/60' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-100/60' },
};

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="tentang" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Tentang Kami</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Apa Itu Bio-Sada?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
            Bio-Sada adalah platform Bank Sampah Digital yang menghubungkan nasabah dengan mitra
            pengepul terverifikasi. Kami mendigitalisasi proses setoran sampah, memberikan transparansi
            harga, dan mempermudah logistik penjemputan di area Malang dan sekitarnya.
          </p>
        </motion.div>

        {/* Values grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item, i) => {
            const colors = COLOR_MAP[item.color];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className={`group rounded-2xl border ${colors.border} bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
