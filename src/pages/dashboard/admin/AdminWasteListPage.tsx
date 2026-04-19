import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  List,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import { useAllWasteCategories, useDeleteWasteCategory } from '@/hooks/useAdminWaste';
import type { WasteCategory } from '@/lib/types';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import WasteFormModal from './WasteFormModal';

type PageSizeOption = 10 | 20 | 50 | 100 | 'all';
const PAGE_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'Semua' },
];

const formatCurrency = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

/**
 * Admin waste list page with CRUD operations.
 * Extends the read-only WasteListPage with edit/delete actions and add button.
 */
export default function AdminWasteListPage() {
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<WasteCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WasteCategory | null>(null);

  const { data: result, isLoading } = useAllWasteCategories({
    page: currentPage,
    pageSize,
  });
  const deleteMutation = useDeleteWasteCategory();

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

  const handleEdit = (item: WasteCategory) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      toast.success(`"${deleteConfirm.name}" berhasil dihapus.`);
      setDeleteConfirm(null);
    } catch {
      toast.error('Gagal menghapus data.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Page Title + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            <List className="h-6 w-6 text-emerald-600" />
            Daftar Limbah
          </h1>
          <p className="mt-1 text-sm text-gray-500">Kelola jenis sampah dan harganya.</p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Jenis
        </Button>
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
              <TableHead className="w-16 text-center">Foto</TableHead>
              <TableHead>Nama Jenis</TableHead>
              <TableHead className="text-right">Harga (Rp/Kg)</TableHead>
              <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: numericPageSize || 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-400">
                  Belum ada data jenis sampah.
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
                  <TableCell className="hidden text-sm text-gray-500 md:table-cell">
                    {item.description ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                      }
                    >
                      {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(item)}
                        className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Add/Edit Modal */}
      <WasteFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editData={editItem}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Hapus Jenis Sampah</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Apakah Anda yakin ingin menghapus{' '}
            <span className="font-semibold text-gray-800">"{deleteConfirm?.name}"</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-gray-500">
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Menghapus...</>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
