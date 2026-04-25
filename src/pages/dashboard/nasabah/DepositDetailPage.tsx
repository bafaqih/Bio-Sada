import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  XCircle,
  Loader2,
  ImageIcon,
  StickyNote,
  BadgeCheck,
  Hourglass,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useDepositDetail, useCancelPickupRequest } from '@/hooks/usePickupRequests';
import type { RequestStatus } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

// ── Status badge config ──────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  accepted: { label: 'Diterima', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  completed: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
};

// ── Helpers ──────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(w => /^[a-zA-Z]/.test(w)) // Only take words starting with letters
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || name[0]?.toUpperCase() || '?';
}

const formatCurrency = (num: number | null) => {
  if (num == null) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return date;
  }
};

const formatDateTime = (dt: string | null | undefined) => {
  if (!dt) return '-';
  try {
    return new Date(dt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dt;
  }
};

/**
 * Deposit Detail page for customers.
 * POV: Customer viewing their own pickup request.
 */
export default function DepositDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading } = useDepositDetail(id);
  const cancelRequest = useCancelPickupRequest();

  // Modal states
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Handle cancel
  const handleCancel = async () => {
    if (!task) return;
    try {
      await cancelRequest.mutateAsync(task.id);
      toast.success('Request berhasil dibatalkan.');
      setShowConfirmCancel(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal membatalkan request.');
    }
  };

  // WhatsApp deep link for Partner
  const getWhatsAppLink = () => {
    if (!task?.partner?.phone_number || !task.customer) return '#';
    const phone = task.partner.phone_number.startsWith('0')
      ? '62' + task.partner.phone_number.slice(1)
      : task.partner.phone_number;
    const text = encodeURIComponent(
      `Halo, saya ${task.customer.full_name} ingin menanyakan status penjemputan sampah saya.`,
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Calculate totals from items
  const calcTotalWeight = (task?.items ?? []).reduce((sum, i) => sum + (i.real_weight ?? i.estimated_weight ?? 0), 0);
  const calcTotalPrice = (task?.items ?? []).reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-gray-400">Request tidak ditemukan.</p>
        <Button variant="link" onClick={() => navigate('/dashboard/deposit/history')} className="mt-2 text-emerald-600">
          Kembali ke Riwayat
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[task.status];
  const isPending = task.status === 'pending';
  const isAccepted = task.status === 'accepted';
  const isHistory = task.status === 'completed' || task.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Back Button + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 text-gray-500 hover:text-emerald-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            Detail Request
          </h1>
          <p className="text-sm text-gray-500">ID: {task.id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Section 1: Partner Info & Pickup Schedule */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Partner Profile */}
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5 h-full flex flex-col">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Profil Mitra Pengepul</h3>
            <div className="flex-1">
              {task.partner ? (
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  {/* Partner info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-emerald-100 shadow-sm">
                        <AvatarImage src={task.partner.avatar_url ?? undefined} alt={task.partner.full_name} className="object-cover" />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-xl">
                          {getInitials(task.partner.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm">
                        <BadgeCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{task.partner.full_name}</h2>
                      <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 w-fit px-3 py-1 rounded-full text-sm">
                        <Phone className="h-3.5 w-3.5" />
                        <span>+{task.partner.phone_number ?? '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp button */}
                  {(isAccepted || task.status === 'completed') && (
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-linear-to-r from-green-500 to-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-600 hover:to-green-700 hover:shadow-md"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Hubungi Mitra
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-4 text-center space-y-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-amber-100 p-3 rounded-full"
                  >
                    <Hourglass className="h-8 w-8 text-amber-600" />
                  </motion.div>
                  <p className="text-sm font-semibold text-amber-800">Mencari mitra terdekat...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pickup Schedule & Location */}
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5 h-full">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Lokasi & Jadwal Jemput</h3>
            <div className="space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-50 p-2 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lokasi Penjemputan</span>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {task.address?.address_detail ?? '-'}{task.address?.city ? `, ${task.address.city}` : ''}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50 mt-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-50 p-2 text-emerald-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</span>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(task.pickup_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-50 p-2 text-emerald-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jam</span>
                    <p className="text-sm font-semibold text-gray-800">{task.pickup_time}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Meta Info (accepted_at, photo, notes) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pickup Photo */}
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <Label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <ImageIcon className="h-4 w-4 text-gray-400" /> Foto Sampah
            </Label>
            {task.waste_photo_url ? (
              <div 
                className="overflow-hidden rounded-lg border border-gray-200 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={task.waste_photo_url}
                  alt="Foto sampah"
                  className="h-48 w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-400">Tidak ada foto</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes + Meta */}
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            <div>
              <Label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <StickyNote className="h-4 w-4 text-gray-400" /> Catatan Saya
              </Label>
              <p className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm text-gray-600">
                {task.notes || 'Tidak ada catatan.'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Dibuat pada</span>
                <span className="font-medium text-gray-800">{formatDateTime(task.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Diterima pada</span>
                <span className="font-medium text-gray-800">
                  {task.accepted_at ? formatDateTime(task.accepted_at) : (
                    <span className="flex items-center gap-1 font-normal text-gray-500">
                      <Hourglass className="h-3 w-3 animate-pulse text-amber-500" /> Menunggu...
                    </span>
                  )}
                </span>
              </div>
              {isHistory && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Selesai pada</span>
                  <span className="font-medium text-emerald-700">{formatDateTime(task.completed_at || task.updated_at)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500">Status Request</span>
                <Badge variant="secondary" className={isHistory ? STATUS_CONFIG.completed.className : statusConfig.className}>
                  {isHistory ? 'Selesai' : statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mitra Pengepul</span>
                <span className="flex items-center gap-1 font-medium text-gray-800">
                  {task.partner ? (
                    <><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {task.partner.full_name}</>
                  ) : (
                    <span className="flex items-center gap-1 font-normal text-gray-500">
                      <Hourglass className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Menunggu...
                    </span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Items Table */}
      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h3 className="text-base font-semibold text-gray-800">Daftar Sampah</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-right">Est. Berat</TableHead>
                <TableHead className="text-right">Berat Asli</TableHead>
                <TableHead className="text-right">Harga/kg</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(task.items ?? []).map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-emerald-50/30">
                  <TableCell className="font-medium text-gray-800">
                    {item.waste_categories?.name ?? '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {item.estimated_weight} kg
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.real_weight ? (
                      <span className="font-semibold text-emerald-700">{item.real_weight} kg</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {formatCurrency(item.price_at_time)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-gray-800">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total Summary */}
          <div className="flex items-center justify-end gap-6 border-t border-gray-100 px-5 py-3">
            <div className="text-sm text-gray-500">
              Total Berat: <span className="font-bold text-gray-900">{calcTotalWeight} kg</span>
            </div>
            <div className="text-sm text-gray-500">
              Total Harga: <span className="text-lg font-bold text-emerald-700">{formatCurrency(calcTotalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setShowConfirmCancel(true)}
            className="h-11 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" /> Batalkan Request
          </Button>
        </div>
      )}

      {/* ── Confirm Cancel Modal ────────────────────────────── */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Batalkan Request?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin membatalkan request penjemputan ini? Tindakan ini tidak dapat diurungkan.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmCancel(false)} className="text-gray-500">
              Tidak
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelRequest.isPending}
              variant="destructive"
            >
              {cancelRequest.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Membatalkan...</>
              ) : (
                'Ya, Batalkan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Image Dialog ────────────────────────────────────── */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl p-1 bg-transparent border-none shadow-none [&>button]:right-4 [&>button]:top-4 [&>button]:bg-white/50 [&>button]:rounded-full [&>button]:text-gray-900 hover:[&>button]:bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto Sampah Diperbesar</DialogTitle>
          </DialogHeader>
          {task?.waste_photo_url && (
            <img 
              src={task.waste_photo_url} 
              alt="Foto Sampah Diperbesar"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
