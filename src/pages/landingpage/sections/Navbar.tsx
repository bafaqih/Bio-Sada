import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Harga Sampah', href: '#harga-sampah' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isReady, setIsReady] = useState(false);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      // Close menu if scrolling occurs (manually or via ScrollToTop)
      if (window.scrollY > 20 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [isOpen]);

  // Intersection Observer for active section
  useEffect(() => {
    // Initial check for hash or scroll position
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash && NAV_LINKS.some(l => l.href === window.location.hash)) {
      setActiveSection(currentHash);
    } else {
      setActiveSection('beranda');
    }

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -80% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrolling.current) return;
      
      const intersecting = entries.filter(e => e.isIntersecting);
      if (intersecting.length > 0) {
        // If multiple sections are detected, pick the one closest to the top
        const target = intersecting.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top - 100) < Math.abs(prev.boundingClientRect.top - 100) 
            ? curr 
            : prev;
        });
        setActiveSection(target.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.href.replace('#', ''));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    
    // Close menu first
    setIsOpen(false);
    
    if (el) {
      isScrolling.current = true;
      setActiveSection(targetId);
      
      // Small timeout to allow menu close animation to start/finish
      // which prevents layout shift issues during scroll
      setTimeout(() => {
        const offset = 80; // height of navbar + some breathing room
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: targetId === 'beranda' ? 0 : offsetPosition,
          behavior: 'smooth'
        });
        
        // Reset isScrolling after smooth scroll finishes
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      }, 100);
    }
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      onAnimationComplete={() => setIsReady(true)}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? 'border-b border-emerald-100/50 bg-white/80 shadow-lg shadow-emerald-900/5 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#beranda"
          onClick={(e) => { e.preventDefault(); handleNavClick('#beranda'); }}
          className="flex items-center gap-2.5"
        >
          <img src="/Bio-Sada.svg" alt="Bio-Sada" className="h-9 w-9 rounded-lg" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Bio-Sada
          </span>
        </a>

        {/* Desktop menu */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-emerald-700' 
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {link.label}
                {isActive && isReady && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700">
              <LogIn className="h-4 w-4" />
              Masuk
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700">
              <UserPlus className="h-4 w-4" />
              Daftar
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-emerald-50 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 -z-10 bg-transparent md:hidden"
                aria-hidden="true"
              />
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-emerald-100/50 bg-white/95 backdrop-blur-xl md:hidden"
            >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-emerald-200 text-emerald-700">
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <UserPlus className="h-4 w-4" />
                    Daftar
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
