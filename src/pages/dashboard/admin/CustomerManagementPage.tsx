import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

import { useCustomerList } from '@/hooks/useAdminUsers';

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type PageSizeOption = 10 | 20 | 50 | 100 | 'all';
const PAGE_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'Semua' },
];

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

/**
 * Customer management page for admin.
 * Shows a paginated table of all customers with detail links.
 */
export default function CustomerManagementPage() {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: result, isLoading } = useCustomerList({
    page: currentPage,
    pageSize,
  });

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Page Title */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <Users className="h-6 w-6 text-emerald-600" />
          Manajemen Nasabah
        </h1>
        <p className="mt-1 text-sm text-gray-500">Daftar seluruh nasabah terdaftar.</p>
      </div>

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
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Username</TableHead>
              <TableHead className="hidden sm:table-cell">No. HP</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: numericPageSize || 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-400">
                  Belum ada nasabah terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              items.map((customer, index) => (
                <TableRow key={customer.id} className="transition-colors hover:bg-emerald-50/30">
                  <TableCell className="text-center text-sm text-gray-500">
                    {startIndex + index}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{customer.full_name}</TableCell>
                  <TableCell className="hidden text-sm text-gray-500 md:table-cell">
                    {customer.username ?? '-'}
                  </TableCell>
                  <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                    {customer.phone_number ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(customer.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/management/customer/${customer.id}`)}
                      className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
    </motion.div>
  );
}
