import { Link } from 'react-router-dom';
import { Recycle } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Harga Sampah', href: '#harga-sampah' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
];

const handleNavClick = (href: string) => {
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100/50 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">
                Bio-Sada
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              Platform Bank Sampah Digital yang menghubungkan nasabah dengan mitra pengepul terverifikasi di Malang dan sekitarnya.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Tautan Cepat</h3>
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

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Akun</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/login" className="text-sm text-gray-500 transition-colors hover:text-emerald-600">
                  Masuk
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-500 transition-colors hover:text-emerald-600">
                  Daftar
                </Link>
              </li>
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
