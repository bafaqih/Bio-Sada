import { useState } from 'react';
import { useWasteCategories } from '@/hooks/useWasteCategories';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type PageSizeOption = 10 | 20 | 50 | 100 | 'all';
const PAGE_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'Semua' },
];

/**
 * Read-only table displaying active waste categories
 * with pagination and page size selector.
 */
export default function WasteListPage() {
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: result, isLoading } = useWasteCategories({
    page: currentPage,
    pageSize,
  });

  const items = result?.data ?? [];
  const totalCount = result?.totalCount ?? 0;

  const numericPageSize = pageSize === 'all' ? totalCount : pageSize;
  const totalPages = numericPageSize > 0 ? Math.ceil(totalCount / numericPageSize) : 1;

  // Calculate display range
  const startIndex = pageSize === 'all' ? 1 : (currentPage - 1) * numericPageSize + 1;
  const endIndex = pageSize === 'all' ? totalCount : Math.min(currentPage * numericPageSize, totalCount);

  const handlePageSizeChange = (value: string) => {
    const newSize = value === 'all' ? 'all' : (parseInt(value) as 10 | 20 | 50 | 100);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
  };

  /** Format currency to Rupiah */
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

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
          <List className="h-6 w-6 text-emerald-600" />
          Daftar Limbah
        </h1>
        <p className="mt-1 text-sm text-gray-500">Jenis sampah yang dapat disetorkan dan harganya.</p>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        {/* Top Bar: Page Size Selector */}
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
              <TableHead className="w-16 text-center">Foto</TableHead>
              <TableHead>Nama Jenis</TableHead>
              <TableHead className="text-right">Harga (Rp/Kg)</TableHead>
              <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: numericPageSize || 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                  Belum ada data limbah yang tersedia.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id} className="transition-colors hover:bg-emerald-50/30">
                  <TableCell className="text-center text-sm text-gray-500">
                    {startIndex + index}
                  </TableCell>
                  <TableCell className="text-center">
                    <Avatar className="mx-auto h-10 w-10 border border-gray-100">
                      <AvatarImage src={item.image_url ?? undefined} alt={item.name} />
                      <AvatarFallback className="bg-emerald-100 text-xs font-medium text-emerald-700">
                        {item.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-700">
                    {formatCurrency(item.price_per_kg)}/{item.unit}
                  </TableCell>
                  <TableCell className="hidden max-w-xs whitespace-normal break-words text-sm text-gray-500 md:table-cell">
                    {item.description ?? '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Bar: Info + Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
          {/* Left: Data range info */}
          <p className="text-sm text-gray-500">
            {totalCount > 0
              ? `Menampilkan ${startIndex} sampai ${endIndex} dari ${totalCount} data`
              : 'Tidak ada data'}
          </p>

          {/* Right: Pagination */}
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
                // Show limited page buttons
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
                // Show ellipsis
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
