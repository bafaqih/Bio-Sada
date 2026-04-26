import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';

const CONTACT_INFO = [
  { icon: Phone, label: 'WhatsApp', value: '+62 821-1831-2630', href: 'https://wa.me/6282118312630' },
  { icon: Mail, label: 'Email', value: 'halo@bio-sada.web.id', href: 'mailto:halo@bio-sada.web.id' },
  { icon: MapPin, label: 'Alamat', value: 'Universitas Negeri Malang, Jl. Cakrawala No.5, Sumbersari, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145', href: null },
];

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/biosadaofficial',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    )
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@biosadaofficial',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    )
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/biosadaofficial',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/biosadaofficial',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733-16z" />
        <path d="M4 20l6.768-6.768m2.464-2.464l6.768-6.768" />
      </svg>
    )
  },
];

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="kontak" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <MessageSquare className="h-3.5 w-3.5" />
              Kontak
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hubungi Kami
          </h2>
          <p className="mt-3 text-gray-500">Punya pertanyaan? Jangan ragu untuk menghubungi kami.</p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="h-full min-h-[340px] overflow-hidden rounded-2xl border border-emerald-100/60 shadow-sm"
          >
            <iframe
              title="Lokasi Bio-Sada"
              src="https://www.google.com/maps?q=Universitas+Negeri+Malang,+Jl.+Cakrawala+No.5,+Sumbersari,+Kec.+Lowokwaru,+Kota+Malang,+Jawa+Timur+65145&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col justify-center space-y-6"
          >
            {CONTACT_INFO.map((item, i) => (
              <div key={i} className="group flex items-start gap-4 rounded-xl border border-emerald-100/60 bg-white/80 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-0.5 text-base font-normal text-gray-900 transition-colors hover:text-emerald-600">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium leading-relaxed text-gray-700">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social media */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm font-medium text-gray-400">Ikuti kami:</span>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/60 bg-white text-gray-500 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
