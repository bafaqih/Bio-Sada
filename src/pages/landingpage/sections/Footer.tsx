import { Link } from 'react-router-dom';
import { Recycle, MapPin, Phone, Mail, LogIn, UserPlus } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Harga Sampah', href: '#harga-sampah' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
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

const handleNavClick = (href: string) => {
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100/50 bg-linear-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-md">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">
                Bio-Sada
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Platform Bank Sampah Digital yang menghubungkan nasabah dengan mitra pengepul terverifikasi di Malang dan sekitarnya.
            </p>
            <div className="mt-4 flex gap-2 text-gray-400">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Universitas Negeri Malang, Jl. Cakrawala No.5, Sumbersari, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Navigasi</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-gray-500 transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Contact */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Akun</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Daftar</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Kontak Kami</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="https://wa.me/6282118312630" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                    <Phone className="h-3.5 w-3.5" />
                    <span>+62 821-1831-2630</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:biosadacom@gmail.com" className="group flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                    <Mail className="h-3.5 w-3.5" />
                    <span>biosadacom@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Ikuti Kami</h3>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                    <s.icon className="h-3.5 w-3.5" />
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-200/60 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2026 Bio-Sada. Platform Bank Sampah Digital.
          </p>
        </div>
      </div>
    </footer>
  );
}
