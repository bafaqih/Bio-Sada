import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recycle, Leaf, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Placeholder dashboard home page.
 * Shows a role-aware greeting and summary cards.
 * Will be replaced by role-specific dashboards in later phases.
 */
export default function DashboardHome() {
  const { profile } = useAuthStore();

  /** Map role to Indonesian display label */
  const roleLabel: Record<string, string> = {
    customers: 'Nasabah',
    partners: 'Mitra Pengepul',
    admin: 'Administrator',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Selamat Datang, {profile?.full_name ?? 'Pengguna'} 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Anda masuk sebagai{' '}
          <span className="font-semibold text-emerald-600">
            {roleLabel[profile?.role ?? ''] ?? profile?.role}
          </span>
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Setoran
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Recycle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">0 kg</p>
              <p className="mt-1 text-xs text-gray-400">Data akan tampil setelah ada transaksi</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Transaksi Aktif
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="mt-1 text-xs text-gray-400">Belum ada transaksi berjalan</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Dampak Lingkungan
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Leaf className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">🌱</p>
              <p className="mt-1 text-xs text-gray-400">Mulai setor sampah untuk dampak nyata!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
