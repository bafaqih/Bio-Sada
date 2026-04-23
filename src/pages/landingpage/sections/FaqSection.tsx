import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Apa itu Bio-Sada?',
    a: 'Bio-Sada adalah platform Bank Sampah Digital yang menghubungkan nasabah (penyetor sampah) dengan mitra pengepul terverifikasi. Kami mempermudah proses setoran sampah dengan layanan penjemputan langsung ke lokasi Anda.',
  },
  {
    q: 'Bagaimana cara mendaftar sebagai nasabah?',
    a: 'Klik tombol "Daftar" di halaman ini, isi formulir pendaftaran dengan data diri Anda, verifikasi email, dan Anda siap menggunakan Bio-Sada. Setelah itu, Anda bisa langsung membuat request penjemputan sampah.',
  },
  {
    q: 'Apakah ada biaya untuk menggunakan Bio-Sada?',
    a: 'Tidak, Bio-Sada sepenuhnya gratis untuk nasabah. Anda justru akan mendapatkan penghasilan dari sampah yang Anda setorkan berdasarkan berat dan harga real-time yang ditampilkan di aplikasi.',
  },
  {
    q: 'Bagaimana sistem pembayarannya?',
    a: 'Saat ini pembayaran dilakukan secara tunai (cash) langsung oleh mitra pengepul di lokasi penjemputan. Nominal pembayaran dihitung otomatis oleh aplikasi berdasarkan berat aktual dan harga per kg saat itu.',
  },
  {
    q: 'Jenis sampah apa saja yang diterima?',
    a: 'Bio-Sada menerima berbagai jenis sampah seperti plastik, kertas, logam, kaca, dan lainnya. Anda bisa melihat daftar lengkap beserta harganya di bagian "Harga Sampah" pada halaman ini atau di dalam aplikasi.',
  },
];

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-emerald-100/60 bg-white/80 backdrop-blur-sm transition-all hover:shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-4 text-base font-semibold text-gray-900">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-emerald-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h2>
        </motion.div>

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            >
              <FaqItem
                q={item.q}
                a={item.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
