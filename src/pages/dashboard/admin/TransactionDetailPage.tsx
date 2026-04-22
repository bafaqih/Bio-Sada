import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CalendarDays,
  Package,
  StickyNote,
  ImageIcon,
} from 'lucide-react';

import { useTransactionDetail } from '@/hooks/useAdminTransactions';
import type { RequestStatus } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/dialog';

// ── Helpers ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Diterima', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700' },
};

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

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
};

const formatCurrency = (num: number | null | undefined) => {
  if (num == null) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatNumber = (num: number) =>
  new Intl.NumberFormat('id-ID').format(num);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Transaction detail page for admin.
 * Shows full transaction info, customer/partner, address, and items breakdown.
 */
export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tx, isLoading } = useTransactionDetail(id);
  const [showImageModal, setShowImageModal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-gray-400">Data transaksi tidak ditemukan.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4 text-emerald-600">
          <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tx.status];

  // Calculate totals from items
  const totalEstWeight = (tx.items ?? []).reduce((sum, item) => sum + (item.estimated_weight ?? 0), 0);
  const totalRealWeight = (tx.items ?? []).reduce((sum, item) => sum + (item.real_weight ?? 0), 0);
  const totalSubtotal = (tx.items ?? []).reduce((sum, item) => sum + (item.subtotal ?? 0), 0);

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
          onClick={() => navigate('/dashboard/transaction')}
          className="gap-1 text-gray-500 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Log Transaksi
        </Button>
      </motion.div>

      {/* Transaction Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">Detail Transaksi</h2>
                  <Badge variant="secondary" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-400 font-mono">ID: {tx.id}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Total Harga</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(tx.total_price)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nasabah</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    {tx.customer?.full_name ?? '-'}
                  </p>
                  <p className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {tx.customer?.phone_number ?? '-'}
                  </p>
                </div>
              </div>

              {/* Partner */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mitra</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    {tx.partner?.full_name ?? <span className="text-gray-300">Belum ditentukan</span>}
                  </p>
                  <p className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {tx.partner?.phone_number ?? '-'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alamat Penjemputan</p>
                <p className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  {tx.address?.address_detail ?? '-'}
                  {tx.address?.city ? `, ${tx.address.city}` : ''}
                </p>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tanggal</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    Pickup: {formatDate(tx.pickup_date)} {tx.pickup_time || ''}
                  </p>
                  {tx.accepted_at && (
                    <p className="text-xs text-gray-400">Diterima: {formatDateTime(tx.accepted_at)}</p>
                  )}
                  {tx.completed_at && (
                    <p className="text-xs text-gray-400">Selesai: {formatDateTime(tx.completed_at)}</p>
                  )}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* Items Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Package className="h-5 w-5 text-emerald-600" />
              Rincian Jenis Sampah
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Jenis Sampah</TableHead>
                  <TableHead className="text-right">Est. Berat</TableHead>
                  <TableHead className="text-right">Berat Asli</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Harga/kg</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tx.items ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                      Tidak ada data item.
                    </TableCell>
                  </TableRow>
                ) : (
                  tx.items!.map((item, index) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-emerald-50/30">
                      <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {item.waste_categories?.name ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {item.estimated_weight} {item.waste_categories?.unit ?? 'kg'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-gray-800">
                        {item.real_weight != null ? `${item.real_weight} ${item.waste_categories?.unit ?? 'kg'}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500 hidden sm:table-cell">
                        {formatCurrency(item.price_at_time)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-emerald-700">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {/* Total Row */}
                {(tx.items ?? []).length > 0 && (
                  <TableRow className="border-t-2 border-gray-200 bg-gray-50/50 font-semibold">
                    <TableCell colSpan={2} className="text-right text-sm text-gray-600">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-700">
                      {formatNumber(totalEstWeight)} kg
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-900">
                      {totalRealWeight > 0 ? `${formatNumber(totalRealWeight)} kg` : '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell" />
                    <TableCell className="text-right text-sm text-emerald-700">
                      {formatCurrency(totalSubtotal)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Waste Photo & Notes Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
        {/* Photo Card */}
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Foto Sampah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tx.waste_photo_url ? (
              <div 
                className="overflow-hidden rounded-lg border border-gray-100 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={tx.waste_photo_url}
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

        {/* Notes Card */}
        <Card className="border-emerald-100/60 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <StickyNote className="h-4 w-4 text-emerald-600" />
                Catatan
              </p>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tx.notes || "Tidak ada catatan."}
                </p>
              </div>
            </div>
            
            <Separator />
            
            {/* Additional Info (Optional, but makes it consistent with mitra view) */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status Transaksi</span>
                <Badge variant="secondary" className={statusConfig.className + " text-[10px] h-5"}>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Metode Pickup</span>
                <span className="font-medium text-gray-800 text-xs">Penjemputan Langsung</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Image Dialog */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl p-1 bg-transparent border-none shadow-none [&>button]:right-4 [&>button]:top-4 [&>button]:bg-white/50 [&>button]:rounded-full [&>button]:text-gray-900 hover:[&>button]:bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto Sampah Diperbesar</DialogTitle>
          </DialogHeader>
          {tx.waste_photo_url && (
            <img 
              src={tx.waste_photo_url} 
              alt="Foto Sampah Diperbesar"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
