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
  Scale,
  CheckCircle2,
  XCircle,
  Loader2,
  ImageIcon,
  StickyNote,
  User,
  BadgeCheck,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import {
  useTaskDetail,
  useWeighItems,
  useCompleteRequest,
  useCancelAcceptedRequest,
} from '@/hooks/usePartnerRequests';
import type { RequestStatus } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

const formatDateTime = (dt: string | null) => {
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
 * Task Detail page for partners.
 * Full view of a pickup request with weigh, contact, cancel, and complete actions.
 */
export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { data: task, isLoading } = useTaskDetail(id);
  const weighItems = useWeighItems();
  const completeRequest = useCompleteRequest();
  const cancelRequest = useCancelAcceptedRequest();

  // Modal states
  const [showWeighModal, setShowWeighModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [weighData, setWeighData] = useState<Record<string, number>>({});

  // Initialize weigh data from existing real_weight values
  const initWeighData = () => {
    const data: Record<string, number> = {};
    (task?.items ?? []).forEach((item) => {
      data[item.id] = item.real_weight ?? 0;
    });
    setWeighData(data);
    setShowWeighModal(true);
  };

  // Handle weigh submission
  const handleWeighSubmit = async () => {
    const items = (task?.items ?? []).map((item) => ({
      itemId: item.id,
      realWeight: weighData[item.id] ?? 0,
      priceAtTime: item.price_at_time,
    }));

    // Validate all items have weight > 0
    if (items.some((i) => i.realWeight <= 0)) {
      toast.error('Semua item harus memiliki berat asli lebih dari 0.');
      return;
    }

    try {
      await weighItems.mutateAsync(items);
      toast.success('Data timbangan berhasil disimpan!');
      setShowWeighModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data timbangan.');
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (!task) return;
    try {
      await cancelRequest.mutateAsync(task.id);
      toast.success('Tugas berhasil dibatalkan.');
      setShowConfirmCancel(false);
      navigate('/dashboard/task/active');
    } catch (error: any) {
      toast.error(error.message || 'Gagal membatalkan tugas.');
    }
  };

  // Handle complete
  const handleComplete = async () => {
    if (!task) return;

    // Validate all items have real_weight
    const allWeighed = (task.items ?? []).every((item) => item.real_weight && item.real_weight > 0);
    if (!allWeighed) {
      toast.error('Semua item harus ditimbang terlebih dahulu sebelum menyelesaikan tugas.');
      setShowConfirmComplete(false);
      return;
    }

    try {
      await completeRequest.mutateAsync(task.id);
      setShowConfirmComplete(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyelesaikan tugas.');
    }
  };

  // WhatsApp deep link
  const getWhatsAppLink = () => {
    if (!task?.customer?.phone_number || !profile) return '#';
    const phone = task.customer.phone_number.startsWith('0')
      ? '62' + task.customer.phone_number.slice(1)
      : task.customer.phone_number;
    const address = task.address?.address_detail
      ? `${task.address.address_detail}, ${task.address.city ?? ''}`
      : 'alamat Anda';
    const text = encodeURIComponent(
      `Halo ${task.customer.full_name}, saya ${profile.full_name} dari Bio-Sada ingin menjemput sampah Anda di ${address}.`,
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
        <p className="text-lg font-semibold text-gray-400">Tugas tidak ditemukan.</p>
        <Button variant="link" onClick={() => navigate('/dashboard/task/active')} className="mt-2 text-emerald-600">
          Kembali ke Tugas Aktif
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[task.status];
  const isAccepted = task.status === 'accepted';

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
            Detail Tugas
          </h1>
          <p className="text-sm text-gray-500">ID: {task.id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Section 1: Customer Info + Actions */}
      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Customer info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{task.customer?.full_name ?? 'Nasabah'}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    +{task.customer?.phone_number ?? '-'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>
                  {task.address?.address_detail ?? '-'}{task.address?.city ? `, ${task.address.city}` : ''}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(task.pickup_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {task.pickup_time}
                </span>
                <Badge variant="secondary" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            {/* WhatsApp button */}
            {isAccepted && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-600 hover:to-green-700 hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" /> Hubungi Nasabah
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Meta Info (accepted_at, photo, notes) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pickup Photo */}
        <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <Label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <ImageIcon className="h-4 w-4 text-gray-400" /> Foto Sampah
            </Label>
            {task.waste_photo_url ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
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
                <StickyNote className="h-4 w-4 text-gray-400" /> Catatan Nasabah
              </Label>
              <p className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm text-gray-600">
                {task.notes || 'Tidak ada catatan.'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Diterima pada</span>
                <span className="font-medium text-gray-800">{formatDateTime(task.accepted_at)}</span>
              </div>
              {task.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Selesai pada</span>
                  <span className="font-medium text-emerald-700">{formatDateTime(task.completed_at)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mitra</span>
                <span className="flex items-center gap-1 font-medium text-gray-800">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {profile?.full_name ?? '-'}
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
            {isAccepted && (
              <Button
                size="sm"
                variant="outline"
                onClick={initWeighData}
                className="h-8 gap-1 border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50"
              >
                <Scale className="h-3.5 w-3.5" /> Timbang
              </Button>
            )}
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
      {isAccepted && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setShowConfirmCancel(true)}
            className="h-11 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" /> Batalkan Tugas
          </Button>
          <Button
            onClick={() => setShowConfirmComplete(true)}
            className="h-11 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
          >
            <CheckCircle2 className="h-5 w-5" /> Selesaikan Tugas
          </Button>
        </div>
      )}

      {/* ── Weigh Modal ─────────────────────────────────────── */}
      <Dialog open={showWeighModal} onOpenChange={setShowWeighModal}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Scale className="h-5 w-5 text-emerald-600" /> Timbang Sampah
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {(task?.items ?? []).map((item) => {
              const realWeight = weighData[item.id] ?? 0;
              const calcSubtotal = realWeight * item.price_at_time;
              return (
                <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">
                      {item.waste_categories?.name ?? 'Sampah'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Est: {item.estimated_weight} kg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-gray-500">Berat Asli (kg)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={realWeight || ''}
                        onChange={(e) =>
                          setWeighData((prev) => ({
                            ...prev,
                            [item.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                        className="h-10 border-gray-200 bg-white text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-gray-500">Subtotal</Label>
                      <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-emerald-700">
                        {formatCurrency(calcSubtotal)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Harga: {formatCurrency(item.price_at_time)}/{item.waste_categories?.unit ?? 'kg'}
                  </p>
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowWeighModal(false)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleWeighSubmit}
              disabled={weighItems.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {weighItems.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                'Simpan Timbangan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Cancel Modal ────────────────────────────── */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Batalkan Tugas?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tugas ini akan dikembalikan ke daftar order dan dapat diambil oleh mitra lain. Yakin ingin membatalkan?
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

      {/* ── Confirm Complete Modal ──────────────────────────── */}
      <Dialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Selesaikan Tugas?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Pastikan semua sampah telah ditimbang. Status akan berubah menjadi <span className="font-semibold text-emerald-600">Selesai</span> dan tidak dapat diubah kembali.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmComplete(false)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleComplete}
              disabled={completeRequest.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {completeRequest.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Memproses...</>
              ) : (
                'Ya, Selesaikan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Success Modal ───────────────────────────────────── */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden text-center" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-col items-center sm:text-center mt-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Tugas Berhasil Diselesaikan! 🎉</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Data transaksi telah dicatat. Terima kasih atas kontribusinya dalam menjaga lingkungan!
          </p>
          <DialogFooter className="mt-4 w-full sm:justify-center">
            <Button
              size="lg"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard/task/history');
              }}
              className="h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
