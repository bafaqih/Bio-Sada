import { useAuthStore } from '@/stores/authStore';
import { useCustomerStats } from '@/hooks/useCustomerStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Recycle, Wallet, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Dashboard home page with real stats for customers.
 * Shows greeting + 3 stat cards fetched via TanStack Query.
 */
export default function DashboardHome() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading } = useCustomerStats(profile?.id);

  const roleLabel: Record<string, string> = {
    customers: 'Nasabah',
    partners: 'Mitra Pengepul',
    admin: 'Administrator',
  };

  /** Format number to Indonesian locale */
  const formatNumber = (num: number) =>
    new Intl.NumberFormat('id-ID').format(num);

  /** Format currency to Rupiah */
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Setoran Sampah */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Setoran Sampah
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Recycle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalWeight ?? 0)} kg
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Akumulasi dari transaksi selesai</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Estimasi Saldo */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Estimasi Saldo
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Wallet className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalEarnings ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Total pendapatan dari penjualan</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Total Transaksi */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Transaksi
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalTransactions ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Transaksi yang telah selesai</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
