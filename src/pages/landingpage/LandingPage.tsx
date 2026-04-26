import { Helmet } from 'react-helmet-async';

import Navbar from './sections/Navbar';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import StatsSection from './sections/StatsSection';
import WastePricingSection from './sections/WastePricingSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FaqSection from './sections/FaqSection';
import ContactSection from './sections/ContactSection';
import Footer from './sections/Footer';
import ScrollToTop from '@/components/shared/ScrollToTop';

/**
 * Landing page — public, SEO-friendly single-page layout for Bio-Sada.
 * All sections scroll-linked via id anchors in the Navbar.
 */
export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Bio-Sada | Bank Sampah Digital — Ubah Sampahmu Jadi Cuan!</title>
        <meta
          name="description"
          content="Bio-Sada adalah platform bank sampah digital yang memudahkan masyarakat untuk mengelola sampah dan mendapatkan penghasilan tambahan. Layanan penjemputan sampah langsung ke rumah Anda."
        />
        <meta name="keywords" content="bank sampah, sampah digital, recycling, daur ulang, Malang, Bio-Sada, pengepul sampah" />
        <link rel="canonical" href="https://bio-sada.web.id/" />
        <meta property="og:title" content="Bio-Sada | Bank Sampah Digital" />
        <meta property="og:description" content="Ubah sampahmu jadi cuan! ♻️ Gabung di Bio-Sada, platform bank sampah digital yang praktis dengan layanan penjemputan langsung ke rumahmu." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bio-sada.web.id/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.png" />
      </Helmet>

      <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <StatsSection />
          <WastePricingSection />
          <HowItWorksSection />
          <FaqSection />
          <ContactSection />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}
