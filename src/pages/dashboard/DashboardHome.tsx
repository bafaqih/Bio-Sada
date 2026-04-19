import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Recycle,
  Wallet,
  ClipboardCheck,
  Package,
  Weight,
  Users,
  ArrowDownUp,
  MapPin,
  Loader2,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useCustomerStats } from '@/hooks/useCustomerStats';
import { usePartnerStats } from '@/hooks/usePartnerStats';
import { usePendingRequests, useAcceptRequest } from '@/hooks/usePartnerRequests';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useAddresses } from '@/hooks/useAddresses';
import type { PickupRequestWithDetails } from '@/lib/types';
import AdminOverviewPage from './admin/AdminOverviewPage';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ── Haversine distance calculation ──────────────────────────

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── Helpers ─────────────────────────────────────────────────

const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num);

const formatCurrency = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// ── Animation variants ──────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── Customer Dashboard ──────────────────────────────────────

function CustomerDashboard() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading } = useCustomerStats(profile?.id);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}

// ── Partner Dashboard ───────────────────────────────────────

type SortMode = 'newest' | 'nearest';

function PartnerDashboard() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePartnerStats(profile?.id);
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingRequests();
  const acceptRequest = useAcceptRequest();
  const { data: partnerAddresses } = useAddresses(profile?.id);

  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [confirmAccept, setConfirmAccept] = useState<PickupRequestWithDetails | null>(null);

  // Enable realtime for partners
  useRealtimeOrders(profile?.role === 'partners');

  // Get partner's primary address coordinates for distance calc
  const partnerAddr = partnerAddresses?.find((a) => a.is_primary) ?? partnerAddresses?.[0];
  const partnerLat = partnerAddr?.latitude;
  const partnerLng = partnerAddr?.longitude;

  // Calculate distances and sort
  const requestsWithDistance = (pendingRequests ?? []).map((req) => {
    let distance: number | null = null;
    if (partnerLat && partnerLng && req.address?.latitude && req.address?.longitude) {
      distance = haversineDistance(partnerLat, partnerLng, req.address.latitude, req.address.longitude);
    }
    return { ...req, distance };
  });

  const sortedRequests = [...requestsWithDistance].sort((a, b) => {
    if (sortMode === 'nearest') {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    }
    // newest — by created_at descending (already default from query)
    return 0;
  });

  const handleAcceptTask = async () => {
    if (!confirmAccept || !profile) return;
    try {
      await acceptRequest.mutateAsync({ requestId: confirmAccept.id, partnerId: profile.id });
      toast.success('Tugas berhasil diambil!');
      setConfirmAccept(null);
      navigate('/dashboard/task/active');
    } catch {
      toast.error('Gagal mengambil tugas. Silakan coba lagi.');
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Tugas Completed
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalCompletedTasks ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Tugas yang telah diselesaikan</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total kg Sampah
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
              <p className="mt-1 text-xs text-gray-400">Akumulasi sampah yang diambil</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Nasabah
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.totalCustomersServed ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Nasabah unik yang dilayani</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Order Masuk (Real-time) */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-gray-800">Daftar Order Masuk</h2>
              {(pendingRequests?.length ?? 0) > 0 && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {pendingRequests?.length} baru
                </Badge>
              )}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortMode(sortMode === 'newest' ? 'nearest' : 'newest')}
              className="h-8 gap-1 border-gray-200 text-xs text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {sortMode === 'newest' ? 'Terbaru' : 'Terdekat'}
            </Button>
          </div>

          {/* Table / Empty State */}
          {requestsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-400">Belum ada sampah yang perlu dijemput</p>
              <p className="mt-1 text-sm text-gray-300">Standby ya! 🚀</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nasabah</TableHead>
                  <TableHead>Kategori Sampah</TableHead>
                  <TableHead className="text-right">Est. Berat</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Jarak & Alamat
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.map((req) => {
                  // Build category display
                  const categories = (req.items ?? [])
                    .map((item) => item.waste_categories?.name)
                    .filter(Boolean);
                  const firstCategory = categories[0] ?? '-';
                  const extraCount = categories.length - 1;

                  const totalEstWeight = (req.items ?? []).reduce(
                    (sum, item) => sum + (item.estimated_weight ?? 0),
                    0,
                  );

                  return (
                    <TableRow key={req.id} className="transition-colors hover:bg-emerald-50/30">
                      <TableCell className="font-medium text-gray-800">
                        {req.customer?.full_name ?? 'Nasabah'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm text-gray-700">{firstCategory}</span>
                          {extraCount > 0 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0">
                              +{extraCount} lainnya
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-gray-800">
                        {totalEstWeight > 0 ? `${totalEstWeight} kg` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {req.distance !== null ? (
                            <span className="font-semibold text-emerald-700">{req.distance.toFixed(1)} km</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          <p className="text-xs text-gray-500 truncate max-w-48">
                            {req.address?.address_detail ?? ''}{req.address?.city ? `, ${req.address.city}` : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => setConfirmAccept(req)}
                          className="h-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
                        >
                          Ambil Tugas
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* Confirm Accept Modal */}
      <Dialog open={!!confirmAccept} onOpenChange={(open) => !open && setConfirmAccept(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Konfirmasi Ambil Tugas</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin mengambil tugas penjemputan sampah dari{' '}
            <span className="font-semibold text-gray-800">{confirmAccept?.customer?.full_name ?? 'nasabah'}</span>?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmAccept(null)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleAcceptTask}
              disabled={acceptRequest.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {acceptRequest.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                'Ya, Ambil Tugas'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function DashboardHome() {
  const { profile } = useAuthStore();

  const roleLabel: Record<string, string> = {
    customers: 'Nasabah',
    partners: 'Mitra Pengepul',
    admin: 'Administrator',
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

      {/* Role-specific content */}
      {profile?.role === 'admin' ? (
        <AdminOverviewPage />
      ) : profile?.role === 'partners' ? (
        <PartnerDashboard />
      ) : (
        <CustomerDashboard />
      )}
    </motion.div>
  );
}
