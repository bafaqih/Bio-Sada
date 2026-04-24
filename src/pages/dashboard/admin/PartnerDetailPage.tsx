import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Shield,
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
  Star,
} from 'lucide-react';

import { useUserDetail, useUserDetailStats, useApprovePartner, useRejectPartner } from '@/hooks/useAdminUsers';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

// ── InfoRow Component ───────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-400 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="truncate text-sm font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}

/**
 * Partner detail page for admin.
 * Shows profile info, address, stats, and approve/reject actions.
 */
export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [localRejected, setLocalRejected] = useState(false);

  const { data: user, isLoading } = useUserDetail(id);
  const { data: stats, isLoading: statsLoading } = useUserDetailStats(id, 'partners');
  const approveMutation = useApprovePartner();
  const rejectMutation = useRejectPartner();

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Mitra berhasil disetujui! 🎉');
      setIsAcceptOpen(false);
    } catch {
      toast.error('Gagal menyetujui mitra.');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await rejectMutation.mutateAsync(id);
      setLocalRejected(true);
      toast.info('Pendaftaran mitra telah ditolak.');
      setIsRejectOpen(false);
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/management/partner')}
          className="mb-4 gap-1 text-gray-500 hover:text-emerald-600 -ml-3"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Mitra
        </Button>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <User className="h-6 w-6 text-emerald-600" />
          Detail Mitra
        </h1>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24 border-2 border-emerald-200">
                  <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:mt-2 sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
                  <p className="text-sm text-gray-500">@{user.username ?? '-'}</p>
                  <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Mitra Pengepul
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Approve/Reject Actions */}
              {!user.is_verified && (
                <div className="flex flex-col gap-2 sm:flex-row shrink-0">
                  {localRejected ? (
                    <Badge variant="outline" className="border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                      <ShieldX className="mr-1.5 h-4 w-4" /> DITOLAK
                    </Badge>
                  ) : (
                    <>
                      <Button
                        onClick={() => setIsAcceptOpen(true)}
                        className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Terima
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsRejectOpen(true)}
                        className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" /> Tolak
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Personal Information Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Informasi Pribadi</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={User} label="Nama Lengkap" value={user.full_name} />
                <InfoRow icon={User} label="Username" value={user.username ?? '-'} />
                <InfoRow icon={Phone} label="Nomor Telepon" value={user.phone_number ? `+${user.phone_number}` : '-'} />
                <InfoRow icon={Mail} label="Email" value={user.email ?? '-'} />
                <InfoRow icon={Shield} label="Role" value="Mitra Pengepul" />
                <InfoRow icon={CalendarDays} label="Bergabung Sejak" value={formatDate(user.created_at)} />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Address List */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Daftar Alamat</h3>
              {!user.addresses || user.addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 py-6 text-center">
                  <p className="text-sm text-gray-500">Belum ada alamat tersimpan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-emerald-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                            {addr.is_primary && (
                              <Badge variant="secondary" className="h-5 bg-emerald-100 px-1.5 text-[10px] text-emerald-700">
                                <Star className="mr-0.5 h-2.5 w-2.5" /> Utama
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{addr.address_detail}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {addr.city}, {addr.province} {addr.postal_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {user.is_verified ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Akun Terverifikasi</p>
                    <p className="text-xs text-gray-500">Akun ini telah terverifikasi sebagai Mitra resmi dan dapat diandalkan oleh nasabah mulai dari tanggal <strong>{formatDate(user.created_at)}</strong>.</p>
                  </div>
                </>
              ) : localRejected ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <ShieldX className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Pendaftaran Ditolak</p>
                    <p className="text-xs text-gray-400">Pendaftaran mitra ini telah ditolak oleh admin. Mitra tidak dapat melakukan aktivitas penjemputan.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <ShieldX className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Menunggu Verifikasi</p>
                    <p className="text-xs text-gray-400">Akun mitra ini belum disetujui. Gunakan tombol Terima atau Tolak pada bagian profil atas.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
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
          <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
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
          <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
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

      {/* Confirmation Dialogs */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Terima Pendaftaran Mitra</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin menyetujui pendaftaran mitra <span className="font-semibold text-gray-800">{user.full_name}</span>? Mitra akan dapat mulai menerima tugas penjemputan sampah.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsAcceptOpen(false)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {approveMutation.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                'Ya, Terima'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Tolak Pendaftaran Mitra</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin menolak pendaftaran mitra <span className="font-semibold text-gray-800">{user.full_name}</span>? Status mitra akan tetap tidak terverifikasi.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {rejectMutation.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                'Ya, Tolak'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
