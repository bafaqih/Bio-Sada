import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/pages/landingpage/sections/Navbar';
import Footer from '@/pages/landingpage/sections/Footer';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-40 min-h-[75vh] relative overflow-hidden">
        <div className="max-w-2xl w-full text-center relative z-10">
          {/* Animated 404 Text */}
          <div className="relative mb-4 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <h1 className="text-6xl md:text-[150px] font-extrabold leading-none bg-linear-to-b from-emerald-500 to-teal-600 bg-clip-text text-transparent select-none">
                404
              </h1>
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 px-4">
              Ups! Halaman Terbuang...
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm md:text-lg px-6">
              Sepertinya halaman yang Anda cari telah didaur ulang atau tidak pernah ada di sini.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/">
              <Button 
                size="lg"
                className="gap-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 h-11 px-6 text-sm"
              >
                <Home className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-11 px-6 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali Sebelumnya
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
