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
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-400">Tidak ada tugas aktif saat ini</p>
          <p className="mt-1 text-sm text-gray-300">Ambil tugas baru dari halaman Dashboard.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2"
        >
          {tasks.map((task) => {
            const categories = (task.items ?? [])
              .map((item) => item.waste_categories?.name)
              .filter(Boolean);
            const totalWeight = (task.items ?? []).reduce(
              (sum, item) => sum + (item.estimated_weight ?? 0),
              0,
            );

            return (
              <motion.div key={task.id} variants={cardVariants}>
                <Card className="group border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-md">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {task.customer?.full_name ?? 'Nasabah'}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-40">
                            {task.address?.address_detail ?? ''}{task.address?.city ? `, ${task.address.city}` : ''}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px]">
                        Accepted
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(task.pickup_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.pickup_time}
                      </span>
                      <span className="font-medium text-gray-700">{totalWeight} kg</span>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {categories.slice(0, 3).map((cat, i) => (
                        <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">
                          {cat}
                        </Badge>
                      ))}
                      {categories.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px]">
                          +{categories.length - 3} lainnya
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmCancel(task)}
                        className="h-8 gap-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Batalkan
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/task/${task.id}`)}
                        className="h-8 gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> Lihat Detail
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
