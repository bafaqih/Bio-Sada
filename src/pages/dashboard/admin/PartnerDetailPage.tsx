import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CalendarDays,
  Weight,
  Wallet,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';

import { useUserDetail, useUserDetailStats, useApprovePartner, useRejectPartner } from '@/hooks/useAdminUsers';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ── Helpers ─────────────────────────────────────────────────

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num);

const formatCurrency = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Partner detail page for admin.
 * Shows profile info, address, stats, and approve/reject actions.
 */
export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserDetail(id);
  const { data: stats, isLoading: statsLoading } = useUserDetailStats(id, 'partners');
  const approveMutation = useApprovePartner();
  const rejectMutation = useRejectPartner();

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Mitra berhasil disetujui! 🎉');
    } catch {
      toast.error('Gagal menyetujui mitra.');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await rejectMutation.mutateAsync(id);
      toast.info('Mitra tetap dalam status belum diverifikasi.');
    } catch {
      toast.error('Gagal memproses penolakan.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-gray-400">Data mitra tidak ditemukan.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4 text-emerald-600">
          <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  const primaryAddr = user.addresses?.find((a) => a.is_primary) ?? user.addresses?.[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/management/partner')}
          className="gap-1 text-gray-500 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Mitra
        </Button>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-emerald-200 shadow-md">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
                  <Badge
                    variant="secondary"
                    className={
                      user.is_verified
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    }
                  >
                    {user.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    @{user.username ?? '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {user.phone_number ?? '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    Bergabung {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              {/* Approve/Reject Actions */}
              {!user.is_verified && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
                  >
                    {approveMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Terima</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {rejectMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                    ) : (
                      <><XCircle className="h-4 w-4" /> Tolak</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Tugas</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-16" /> : (
                <p className="text-xl font-bold text-gray-900">{formatNumber(stats?.totalTransactions ?? 0)}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Berat</CardTitle>
              <Weight className="h-5 w-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-20" /> : (
                <p className="text-xl font-bold text-gray-900">{formatNumber(stats?.totalWeight ?? 0)} kg</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Nilai</CardTitle>
              <Wallet className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-7 w-28" /> : (
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.totalEarnings ?? 0)}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Address Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-emerald-600" /> Alamat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!primaryAddr ? (
              <p className="text-sm text-gray-400">Belum ada alamat yang terdaftar.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {primaryAddr.label}
                  </Badge>
                  {primaryAddr.is_primary && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Utama</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{primaryAddr.address_detail}</p>
                <p className="text-xs text-gray-400">
                  {primaryAddr.city}, {primaryAddr.province} {primaryAddr.postal_code}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {user.is_verified ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Akun Terverifikasi</p>
                    <p className="text-xs text-gray-400">Mitra ini sudah disetujui oleh admin dan dapat menerima tugas.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <ShieldX className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Menunggu Verifikasi</p>
                    <p className="text-xs text-gray-400">Akun mitra ini belum disetujui. Gunakan tombol Terima atau Tolak di atas.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
