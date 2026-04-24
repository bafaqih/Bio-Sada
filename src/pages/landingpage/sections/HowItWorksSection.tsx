import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ClipboardList, Truck, Scale, Banknote, Zap } from 'lucide-react';

const STEPS = [
  { icon: ClipboardList, title: 'Pilah', desc: 'Pisahkan sampahmu berdasarkan jenis seperti plastik, kertas, logam, dan lainnya.', step: '01' },
  { icon: Truck, title: 'Request', desc: 'Buat permintaan penjemputan dari aplikasi Bio-Sada. Pilih alamat dan waktu yang sesuai.', step: '02' },
  { icon: Scale, title: 'Jemput', desc: 'Mitra pengepul terverifikasi datang ke lokasimu, menimbang sampah secara akurat.', step: '03' },
  { icon: Banknote, title: 'Cuan', desc: 'Terima pembayaran langsung berdasarkan berat dan harga real-time. Transparan!', step: '04' },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="cara-kerja" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <Zap className="h-3.5 w-3.5" />
              Cara Kerja
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Bagaimana Bio-Sada Bekerja?
          </h2>
          <p className="mt-3 text-gray-500">4 langkah mudah untuk mulai menghasilkan dari sampahmu.</p>
        </motion.div>

        <div className="relative mt-14">
          {/* Connector line (desktop) */}
          <div className="absolute top-16 right-0 left-0 hidden h-0.5 bg-linear-to-r from-emerald-200 via-teal-300 to-emerald-200 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Step number circle */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-110">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                {/* Step badge */}
                <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                  Langkah {step.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
