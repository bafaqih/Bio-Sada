import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  MapPin,
  Calendar,
  Clock,
  Eye,
  XCircle,
  Loader2,
  Package,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { usePartnerActiveTasks, useCancelAcceptedRequest } from '@/hooks/usePartnerRequests';
import type { PickupRequestWithDetails } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ── Animation variants ──────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Active Tasks page for partners.
 * Shows cards of accepted pickup requests with cancel + detail actions.
 */
export default function ActiveTasksPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { data: tasks, isLoading } = usePartnerActiveTasks(profile?.id);
  const cancelRequest = useCancelAcceptedRequest();

  const [confirmCancel, setConfirmCancel] = useState<PickupRequestWithDetails | null>(null);

  const handleCancelTask = async () => {
    if (!confirmCancel) return;
    try {
      await cancelRequest.mutateAsync(confirmCancel.id);
      toast.success('Tugas berhasil dibatalkan dan dikembalikan ke daftar order.');
      setConfirmCancel(null);
    } catch {
      toast.error('Gagal membatalkan tugas. Silakan coba lagi.');
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return date;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <ClipboardList className="h-6 w-6 text-emerald-600" />
          Tugas Aktif
        </h1>
        <p className="mt-1 text-sm text-gray-500">Daftar tugas penjemputan yang telah Anda terima.</p>
      </div>

      {isLoading ? (

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-4">
            <Package className="h-10 w-10 text-emerald-200" />
          </div>
          <p className="text-lg font-bold text-gray-900">Belum Ada Tugas Aktif</p>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">
            Daftar tugas yang Anda ambil akan muncul di sini. Silakan cari tugas baru di dashboard.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {tasks.map((task) => {
            const categories = (task.items ?? [])
              .map((item) => item.waste_categories?.name)
              .filter(Boolean);
            const totalWeight = (task.items ?? []).reduce(
              (sum, item) => sum + (item.estimated_weight ?? 0),
              0,
            );
            const fullName = task.customer?.full_name ?? 'Nasabah';
            const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            return (
              <motion.div key={task.id} variants={cardVariants}>
                <Card className="group relative overflow-hidden border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="px-6 py-4">
                    {/* Header: Customer & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {task.customer?.avatar_url ? (
                          <img 
                            src={task.customer.avatar_url} 
                            alt={fullName} 
                            className="h-12 w-12 shrink-0 rounded-full object-cover border border-emerald-100 shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-lg shadow-inner">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {fullName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Badge variant="outline" className="h-5 px-1.5 py-0 border-blue-100 bg-blue-50/50 text-blue-600 font-medium text-[10px] uppercase tracking-wider">
                              <span className="mr-1 h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                              Aktif
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="mb-4 rounded-xl bg-gray-50 p-2.5 transition-colors group-hover:bg-emerald-50/30">
                      <div className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="line-clamp-2">
                          {task.address?.address_detail ?? ''}{task.address?.city ? `, ${task.address.city}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-2 text-center shadow-sm">
                        <Package className="mb-1 h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Berat</span>
                        <span className="text-xs font-bold text-gray-900">{totalWeight}kg</span>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-2 text-center shadow-sm">
                        <Calendar className="mb-1 h-3.5 w-3.5 text-blue-500" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Tanggal</span>
                        <span className="text-xs font-bold text-gray-900">{formatDate(task.pickup_date)}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-2 text-center shadow-sm">
                        <Clock className="mb-1 h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Waktu</span>
                        <span className="text-xs font-bold text-gray-900">{task.pickup_time}</span>
                      </div>
                    </div>

                    {/* Categories Tagline */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {categories.slice(0, 2).map((cat, i) => (
                        <Badge key={i} variant="secondary" className="h-5 bg-emerald-50/80 text-emerald-700 text-[10px] font-medium hover:bg-emerald-100 transition-colors">
                          {cat}
                        </Badge>
                      ))}
                      {categories.length > 2 && (
                        <Badge variant="secondary" className="h-5 bg-gray-50 text-gray-500 text-[10px] font-medium">
                          +{categories.length - 2} lainnya
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmCancel(task)}
                        className="h-9 flex-1 gap-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 transition-all rounded-lg"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Batal
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/task/${task.id}`)}
                        className="h-9 flex-2 gap-1.5 bg-linear-to-r from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all rounded-lg"
                      >
                        <Eye className="h-4 w-4" /> Lihat Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}


      {/* Confirm Cancel Modal */}
      <Dialog open={!!confirmCancel} onOpenChange={(open) => !open && setConfirmCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Batalkan Tugas?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tugas penjemputan untuk{' '}
            <span className="font-semibold text-gray-800">{confirmCancel?.customer?.full_name ?? 'nasabah'}</span>{' '}
            akan dikembalikan ke daftar order. Yakin ingin membatalkan?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmCancel(null)} className="text-gray-500">
              Tidak
            </Button>
            <Button
              onClick={handleCancelTask}
              disabled={cancelRequest.isPending}
              variant="destructive"
              className="shadow-sm"
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
    </motion.div>
  );
}
