import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Weight,
  Wallet,
  UserCheck,
  Package,
  ArrowRight,
} from 'lucide-react';

import { useAdminStats, useUnverifiedPartnersPreview, usePendingRequestsPreview } from '@/hooks/useAdminStats';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ── Helpers ─────────────────────────────────────────────────

const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num);

const formatCurrency = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

// ── Animation variants ──────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Admin overview component rendered within DashboardHome.
 * Shows: 3 stat cards, unverified partners table, pending requests table.
 */
export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: unverifiedPartners, isLoading: partnersLoading } = useUnverifiedPartnersPreview(5);
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingRequestsPreview(5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Stat Cards ────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Nasabah & Mitra */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Nasabah & Mitra
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalUsers ?? 0)}
                </p>
              )}
              {statsLoading ? (
                <Skeleton className="mt-1 h-4 w-40" />
              ) : (
                <p className="mt-1 text-xs text-gray-400">
                  {formatNumber(stats?.totalCustomers ?? 0)} Nasabah · {formatNumber(stats?.totalPartners ?? 0)} Mitra
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Berat Sampah */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Berat Terkumpul
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Weight className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalWeightCollected ?? 0)} kg
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Akumulasi dari seluruh transaksi</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Transaksi */}
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Nilai Transaksi
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Wallet className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalTransactionValue ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Dari transaksi yang telah selesai</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Mitra Belum Diverifikasi ──────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-semibold text-gray-800">Mitra Baru Belum Diverifikasi</h2>
              {(unverifiedPartners?.length ?? 0) > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {unverifiedPartners?.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/management/partner')}
              className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {partnersLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (unverifiedPartners?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-3">
                <UserCheck className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Semua mitra sudah diverifikasi 🎉</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead className="hidden sm:table-cell">No. HP</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unverifiedPartners?.map((partner, index) => (
                  <TableRow key={partner.id} className="transition-colors hover:bg-emerald-50/30">
                    <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">{partner.full_name}</TableCell>
                    <TableCell className="hidden text-sm text-gray-500 md:table-cell">
                      {partner.username ?? '-'}
                    </TableCell>
                    <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                      {partner.phone_number ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(partner.created_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/management/partner/${partner.id}`)}
                        className="h-7 gap-1 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Detail <ArrowRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* ── Permintaan Pending ────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-800">Permintaan Pending</h2>
              {(pendingRequests?.length ?? 0) > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {pendingRequests?.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/transaction')}
              className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {requestsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (pendingRequests?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-3">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Tidak ada permintaan pending saat ini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nasabah</TableHead>
                  <TableHead className="hidden md:table-cell">Alamat</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests?.map((req, index) => (
                  <TableRow key={req.id} className="transition-colors hover:bg-emerald-50/30">
                    <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-800">
                      {(req.customer as { full_name?: string })?.full_name ?? '-'}
                    </TableCell>
                    <TableCell className="hidden text-sm text-gray-500 md:table-cell">
                      <span className="truncate max-w-48 block">
                        {(req.address as { address_detail?: string; city?: string })?.address_detail ?? '-'}
                        {(req.address as { city?: string })?.city ? `, ${(req.address as { city?: string }).city}` : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(req.pickup_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/transaction/${req.id}`)}
                        className="h-7 gap-1 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Detail <ArrowRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
