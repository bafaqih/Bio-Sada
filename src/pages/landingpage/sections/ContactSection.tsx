import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

const CONTACT_INFO = [
  { icon: Phone, label: 'WhatsApp', value: '+62 812-3456-7890', href: 'https://wa.me/6281234567890' },
  { icon: Mail, label: 'Email', value: 'info@bio-sada.com', href: 'mailto:info@bio-sada.com' },
  { icon: MapPin, label: 'Alamat', value: 'Jl. Veteran No.1, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145', href: null },
];

const SOCIALS = [
  { label: 'WhatsApp', href: 'https://wa.me/6281234567890', icon: MessageCircle },
  { label: 'Email', href: 'mailto:info@bio-sada.com', icon: Mail },
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
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Kontak</span>
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
            className="overflow-hidden rounded-2xl border border-emerald-100/60 shadow-sm"
          >
            <iframe
              title="Lokasi Bio-Sada"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.364!2d112.614!3d-7.966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd629a7a3c0e4e3%3A0x3030bfbcaf770b0!2sMalang%2C+Kota+Malang%2C+Jawa+Timur!5e0!3m2!1sid!2sid!4v1"
              width="100%"
              height="340"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
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
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-0.5 text-base font-semibold text-gray-900 transition-colors hover:text-emerald-600">
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
