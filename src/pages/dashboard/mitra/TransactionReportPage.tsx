import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  Download,
  CalendarDays,
  Search,
  Loader2,
  PackageOpen,
  ArrowRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { useAuthStore } from '@/stores/authStore';
import { usePartnerReport, fetchReportRange } from '@/hooks/usePartnerReport';
import type { MonthlyPartnerReport } from '@/lib/types';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ── Constants ────────────────────────────────────────────────

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

function getMonthLabel(m: number) {
  return MONTHS.find((x) => x.value === m)?.label ?? '';
}

/** Build list of available years (current year + 3 years back) */
function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 4 }, (_, i) => current - i);
}

// ── Formatters ───────────────────────────────────────────────

function formatCurrency(num: number | null) {
  if (num == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDateTime(date: string | null | undefined) {
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
}

/** Short request id for display */
function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// ── Helpers: calculate month difference ──────────────────────

function monthDiff(sm: number, sy: number, em: number, ey: number) {
  return (ey - sy) * 12 + (em - sm) + 1;
}

function isEndBeforeStart(sm: number, sy: number, em: number, ey: number) {
  return ey < sy || (ey === sy && em < sm);
}

// ── Excel generation ─────────────────────────────────────────

function generateExcel(
  data: MonthlyPartnerReport[],
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
) {
  // We need to keep track of request groups to assign "No" correctly and handle merges
  const rows: any[] = [];
  const merges: XLSX.Range[] = [];
  
  let currentNo = 0;
  let lastRequestId = '';

  data.forEach((row) => {
    if (row.request_id !== lastRequestId) {
      currentNo++;
      lastRequestId = row.request_id;
      
      // Calculate how many rows this request has
      const requestRows = data.filter(d => d.request_id === row.request_id).length;
      if (requestRows > 1) {
        const startR = rows.length + 1; // +1 for header
        const endR = startR + requestRows - 1;
        
        // Columns to merge: No (0), ID Transaksi (1), Tanggal Selesai (2), Bulan (3), Tahun (4), 
        // Nama Pelanggan (5), No. HP Pelanggan (6), Alamat (7), Kota (8), Total Transaksi (13)
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 13].forEach(col => {
          merges.push({
            s: { r: startR, c: col },
            e: { r: endR, c: col }
          });
        });
      }
    }

    rows.push({
      'No': currentNo,
      'ID Transaksi': row.request_id,
      'Tanggal Selesai': formatDateTime(row.completed_at),
      'Bulan': row.report_month?.trim() ?? '',
      'Tahun': row.report_year?.trim() ?? '',
      'Nama Pelanggan': row.customer_name,
      'No. HP Pelanggan': row.customer_phone ?? '-',
      'Alamat': row.address_detail,
      'Kota': row.city,
      'Kategori Sampah': row.waste_category,
      'Berat Riil (kg)': row.real_weight,
      'Harga per Kg (Rp)': row.price_at_time,
      'Subtotal (Rp)': row.subtotal,
      'Total Transaksi (Rp)': row.total_request_amount,
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!merges'] = merges;

  // Auto-size columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String(r[key as keyof typeof r] ?? '').length),
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Transaksi');

  const startLabel = getMonthLabel(startMonth).slice(0, 3) + startYear;
  const endLabel = getMonthLabel(endMonth).slice(0, 3) + endYear;
  const filename =
    startMonth === endMonth && startYear === endYear
      ? `Laporan_Transaksi_${startLabel}.xlsx`
      : `Laporan_Transaksi_${startLabel}-${endLabel}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

// ── Main Component ───────────────────────────────────────────

export default function TransactionReportPage() {
  const { profile } = useAuthStore();
  const now = new Date();
  const yearOptions = getYearOptions();

  // Filter state
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // Download modal state
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [dlStartMonth, setDlStartMonth] = useState(now.getMonth() + 1);
  const [dlStartYear, setDlStartYear] = useState(now.getFullYear());
  const [dlEndMonth, setDlEndMonth] = useState(now.getMonth() + 1);
  const [dlEndYear, setDlEndYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState(false);

  // Data fetching
  const { data: reportData, isLoading } = usePartnerReport({
    partnerId: profile?.id,
    month: filterMonth,
    year: filterYear,
  });

  const items = reportData ?? [];

  // Group rows for UI display (1 row per request)
  const uiItems = useMemo(() => {
    const groups: Record<string, {
      request_id: string;
      completed_at: string;
      customer_name: string;
      categories: string[];
      total_weight: number;
      total_amount: number;
    }> = {};

    items.forEach((item) => {
      if (!groups[item.request_id]) {
        groups[item.request_id] = {
          request_id: item.request_id,
          completed_at: item.completed_at,
          customer_name: item.customer_name,
          categories: [],
          total_weight: 0,
          total_amount: item.total_request_amount,
        };
      }
      groups[item.request_id].categories.push(item.waste_category);
      groups[item.request_id].total_weight += item.real_weight;
    });

    return Object.values(groups);
  }, [items]);

  // Summary stats
  const summary = useMemo(() => {
    const totalWeight = items.reduce((sum, i) => sum + (i.real_weight ?? 0), 0);
    const totalRevenue = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0);
    const uniqueRequests = new Set(items.map((i) => i.request_id)).size;
    return { totalWeight, totalRevenue, uniqueRequests };
  }, [items]);

  // Download validation
  const dlRangeInvalid = isEndBeforeStart(dlStartMonth, dlStartYear, dlEndMonth, dlEndYear);
  const dlRangeTooLong = monthDiff(dlStartMonth, dlStartYear, dlEndMonth, dlEndYear) > 12;
  const dlDisabled = dlRangeInvalid || dlRangeTooLong || downloading;

  // Computed download preview text
  const dlPreviewText = useMemo(() => {
    if (dlRangeInvalid) return 'Periode akhir harus setelah periode awal';
    if (dlRangeTooLong) return 'Maksimal rentang 12 bulan (1 tahun)';
    const startLabel = `${getMonthLabel(dlStartMonth)} ${dlStartYear}`;
    const endLabel = `${getMonthLabel(dlEndMonth)} ${dlEndYear}`;
    if (dlStartMonth === dlEndMonth && dlStartYear === dlEndYear) {
      return `Laporan: ${startLabel}`;
    }
    return `Laporan: ${startLabel} — ${endLabel}`;
  }, [dlStartMonth, dlStartYear, dlEndMonth, dlEndYear, dlRangeInvalid, dlRangeTooLong]);

  // Handle download
  const handleDownload = async () => {
    if (!profile?.id) return;
    setDownloading(true);
    try {
      const data = await fetchReportRange(
        profile.id,
        dlStartMonth,
        dlStartYear,
        dlEndMonth,
        dlEndYear,
      );

      if (data.length === 0) {
        toast.info('Tidak ada data transaksi untuk periode yang dipilih.');
        return;
      }

      generateExcel(data, dlStartMonth, dlStartYear, dlEndMonth, dlEndYear);
      toast.success('File Excel berhasil diunduh!');
      setDownloadOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh laporan. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Laporan Transaksi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan transaksi penjemputan sampah yang telah diselesaikan.
          </p>
        </div>

        <Button
          id="btn-download-excel"
          onClick={() => setDownloadOpen(true)}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/30"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <CalendarDays className="h-4.5 w-4.5 text-emerald-500" />
        <span className="text-sm font-medium text-gray-600">Periode:</span>

        <Select value={String(filterMonth)} onValueChange={(v) => setFilterMonth(Number(v))}>
          <SelectTrigger className="h-9 w-[130px] border-gray-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(filterYear)} onValueChange={(v) => setFilterYear(Number(v))}>
          <SelectTrigger className="h-9 w-[100px] border-gray-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Search className="h-3.5 w-3.5" />
          <span>{uiItems.length} transaksi ditemukan</span>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-emerald-600/70">Total Transaksi</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.uniqueRequests}</p>
          <p className="text-xs text-gray-400">penjemputan selesai</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-blue-600/70">Total Berat</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {summary.totalWeight.toFixed(1)} <span className="text-base font-semibold">kg</span>
          </p>
          <p className="text-xs text-gray-400">berat riil dikumpulkan</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-amber-600/70">Total Pendapatan</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-gray-400">bulan ini</p>
        </motion.div>
      </div>

      {/* ── Data Table ─────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>ID Transaksi</TableHead>
                <TableHead>Nasabah</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Total Berat (kg)</TableHead>
                <TableHead className="text-right">Total Transaksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : uiItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <PackageOpen className="h-7 w-7 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Belum ada data</p>
                        <p className="mt-0.5 text-xs text-gray-300">
                          Tidak ada transaksi selesai untuk {getMonthLabel(filterMonth)} {filterYear}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                uiItems.map((row, index) => {
                  const categoryText = row.categories.length > 1 
                    ? `${row.categories[0]} + ${row.categories.length - 1} lainnya` 
                    : row.categories[0];

                  return (
                    <TableRow
                      key={row.request_id}
                      className="transition-colors hover:bg-emerald-50/30"
                    >
                      <TableCell className="text-center text-sm text-gray-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(row.completed_at)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-600">
                          {shortId(row.request_id)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {row.customer_name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {categoryText}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-gray-800">
                        {row.total_weight.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-emerald-700">
                        {formatCurrency(row.total_amount)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Info */}
        {!isLoading && uiItems.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-medium text-gray-700">{uiItems.length}</span> transaksi untuk{' '}
              <span className="font-medium text-gray-700">{getMonthLabel(filterMonth)} {filterYear}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Download Excel Modal ───────────────────────── */}
      <AnimatePresence>
        {downloadOpen && (
          <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-emerald-600" />
                  Download Laporan Excel
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <p className="text-sm text-gray-500">
                  Pilih rentang periode laporan yang ingin diunduh. Maksimal 12 bulan (1 tahun) per download.
                </p>

                {/* Start period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dari</label>
                  <div className="flex gap-2">
                    <Select value={String(dlStartMonth)} onValueChange={(v) => setDlStartMonth(Number(v))}>
                      <SelectTrigger className="h-10 flex-1 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={String(dlStartYear)} onValueChange={(v) => setDlStartYear(Number(v))}>
                      <SelectTrigger className="h-10 w-[100px] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* End period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sampai</label>
                  <div className="flex gap-2">
                    <Select value={String(dlEndMonth)} onValueChange={(v) => setDlEndMonth(Number(v))}>
                      <SelectTrigger className="h-10 flex-1 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={String(dlEndYear)} onValueChange={(v) => setDlEndYear(Number(v))}>
                      <SelectTrigger className="h-10 w-[100px] border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview / Validation */}
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                    dlRangeInvalid || dlRangeTooLong
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {dlRangeInvalid || dlRangeTooLong ? (
                    <span className="text-red-400">⚠</span>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                  )}
                  <span className="font-medium">{dlPreviewText}</span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDownloadOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Batal
                </Button>
                <Button
                  id="btn-confirm-download"
                  onClick={handleDownload}
                  disabled={dlDisabled}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
