import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, XCircle } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { usePickupRequests, useCancelPickupRequest } from '@/hooks/usePickupRequests';
import type { RequestStatus } from '@/lib/types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ── Status badge config ──────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  accepted: { label: 'Diterima', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  completed: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
};

type PageSizeOption = 10 | 20 | 50 | 100 | 'all';
const PAGE_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'Semua' },
];

/**
 * Deposit history page showing a paginated table of pickup requests
 * with colored status badges and cancel action for pending requests.
 */
export default function DepositHistoryPage() {
  const { profile } = useAuthStore();
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: result, isLoading } = usePickupRequests({
    customerId: profile?.id,
    page: currentPage,
    pageSize,
  });

  const cancelRequest = useCancelPickupRequest();

  const items = result?.data ?? [];
  const totalCount = result?.totalCount ?? 0;

  const numericPageSize = pageSize === 'all' ? totalCount : pageSize;
  const totalPages = numericPageSize > 0 ? Math.ceil(totalCount / numericPageSize) : 1;

  const startIndex = pageSize === 'all' ? 1 : (currentPage - 1) * numericPageSize + 1;
  const endIndex = pageSize === 'all' ? totalCount : Math.min(currentPage * numericPageSize, totalCount);

  const handlePageSizeChange = (value: string) => {
    const newSize = value === 'all' ? 'all' : (parseInt(value) as 10 | 20 | 50 | 100);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelRequest.mutateAsync(requestId);
      toast.success('Request berhasil dibatalkan.');
    } catch {
      toast.error('Gagal membatalkan request.');
    }
  };

  const formatCurrency = (num: number | null) => {
    if (num == null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const d = new Date(date);
      const formatted = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${formatted}, ${time}`;
    } catch {
      return `${date}, ${time}`;
    }
  };

  return (
    <div className="space-y-0">
      {/* Table Container */}
      <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        {/* Top Bar: Page Size */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <span className="text-sm text-gray-500">Tampilkan</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-20 border-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">data</span>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Tanggal / Jam</TableHead>
              <TableHead className="text-right">Total Berat</TableHead>
              <TableHead className="text-right">Total Harga</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: numericPageSize || 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                  Belum ada riwayat request penjemputan.
                </TableCell>
              </TableRow>
            ) : (
              items.map((req, index) => {
                const status = STATUS_CONFIG[req.status];
                return (
                  <TableRow key={req.id} className="transition-colors hover:bg-emerald-50/30">
                    <TableCell className="text-center text-sm text-gray-500">
                      {startIndex + index}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {formatDateTime(req.pickup_date, req.pickup_time)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-gray-800">
                      {req.total_weight != null ? `${req.total_weight} kg` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-emerald-700">
                      {formatCurrency(req.total_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {req.status === 'pending' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelRequest.isPending}
                          className="h-7 gap-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Batalkan
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Bottom Bar: Info + Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
          <p className="text-sm text-gray-500">
            {totalCount > 0
              ? `Menampilkan ${startIndex} sampai ${endIndex} dari ${totalCount} data`
              : 'Tidak ada data'}
          </p>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-emerald-600"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 text-sm ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'text-gray-500 hover:text-emerald-600'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                }
                if (page === 2 && currentPage > 3) {
                  return <span key="dots-start" className="px-1 text-gray-400">...</span>;
                }
                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return <span key="dots-end" className="px-1 text-gray-400">...</span>;
                }
                return null;
              })}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-emerald-600"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
