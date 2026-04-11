import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, ImagePlus, X, ArrowDownToLine } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useActiveWasteCategories } from '@/hooks/useWasteCategories';
import { useAddresses } from '@/hooks/useAddresses';
import { useCreatePickupRequest, uploadWastePhoto } from '@/hooks/usePickupRequests';
import type { DepositFormItem, WasteCategory } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// ── Empty item factory ───────────────────────────────────────

function createEmptyItem(): DepositFormItem {
  return {
    categoryId: '',
    categoryName: '',
    estimatedWeight: 0,
    pricePerKg: 0,
    subtotal: 0,
  };
}

/**
 * Dynamic form for creating a waste pickup request.
 * Supports multiple waste items per request.
 */
export default function DepositRequestPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  // Data queries
  const { data: categories, isLoading: categoriesLoading } = useActiveWasteCategories();
  const { data: addresses, isLoading: addressesLoading } = useAddresses(profile?.id);
  const createRequest = useCreatePickupRequest();

  // Form state
  const [addressId, setAddressId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DepositFormItem[]>([createEmptyItem()]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select primary address
  const primaryAddress = addresses?.find((a) => a.is_primary);
  const selectedAddressId = addressId || primaryAddress?.id || '';

  // ── Item handlers ──────────────────────────────────────────

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Minimal 1 jenis sampah harus dipilih.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<DepositFormItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };
        // Recalculate subtotal
        updated.subtotal = updated.estimatedWeight * updated.pricePerKg;
        return updated;
      }),
    );
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const cat = categories?.find((c: WasteCategory) => c.id === categoryId);
    if (!cat) return;
    updateItem(index, {
      categoryId: cat.id,
      categoryName: cat.name,
      pricePerKg: cat.price_per_kg,
    });
  };

  // ── Photo handler ──────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB sebelum dikompres.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Totals ─────────────────────────────────────────────────

  const totalWeight = items.reduce((sum, item) => sum + item.estimatedWeight, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // ── Submit ─────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedAddressId) {
      toast.error('Pilih alamat pengambilan.');
      return;
    }
    if (!pickupDate || !pickupTime) {
      toast.error('Tanggal dan jam pengambilan wajib diisi.');
      return;
    }
    if (items.some((item) => !item.categoryId || item.estimatedWeight <= 0)) {
      toast.error('Lengkapi semua jenis sampah dan estimasi berat.');
      return;
    }

    if (!photoFile) {
      toast.error('Foto sampah wajib diunggah.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photo
      let wastePhotoUrl: string | null = null;
      if (photoFile && profile) {
        wastePhotoUrl = await uploadWastePhoto(photoFile, profile.id, profile.username);
      }

      await createRequest.mutateAsync({
        customerId: profile!.id,
        addressId: selectedAddressId,
        pickupDate,
        pickupTime,
        wastePhotoUrl,
        notes,
        items,
      });

      toast.success('Request penjemputan berhasil dikirim!');
      navigate('/dashboard/deposit/history');
    } catch {
      toast.error('Gagal mengirim request. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (categoriesLoading || addressesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <ArrowDownToLine className="h-6 w-6 text-emerald-600" />
          Request Penjemputan
        </h1>
        <p className="mt-1 text-sm text-gray-500">Isi formulir untuk request penjemputan sampah Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
      {/* Address + Date/Time */}
      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          {/* Address */}
          <div className="flex flex-col gap-2 md:col-span-1">
            <Label className="text-gray-700">
              Alamat Pengambilan <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedAddressId} onValueChange={setAddressId}>
              <SelectTrigger className="h-11 border-gray-200 bg-white/70 focus:border-emerald-400 focus:ring-emerald-400/20">
                <SelectValue placeholder="Pilih alamat" />
              </SelectTrigger>
              <SelectContent>
                {addresses?.map((addr) => (
                  <SelectItem key={addr.id} value={addr.id}>
                    {addr.label} — {addr.city}
                    {addr.is_primary ? ' (Utama)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {addresses && addresses.length === 0 && (
              <p className="text-xs text-amber-600">Belum ada alamat. Tambahkan di profil Anda.</p>
            )}
          </div>

          {/* Pickup Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="pickup-date" className="text-gray-700">
              Tanggal Ambil <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickup-date"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>

          {/* Pickup Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="pickup-time" className="text-gray-700">
              Jam Ambil <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickup-time"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Waste Items */}
      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-gray-800">Jenis Sampah</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addItem}
              className="gap-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" /> Tambah Jenis
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sampah #{index + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-7 w-7 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {/* Category */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-gray-500">Jenis Sampah</Label>
                  <Select
                    value={item.categoryId}
                    onValueChange={(val) => handleCategoryChange(index, val)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: WasteCategory) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} — {formatCurrency(cat.price_per_kg)}/{cat.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Weight */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500">Estimasi Berat (kg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={item.estimatedWeight || ''}
                    onChange={(e) =>
                      updateItem(index, { estimatedWeight: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="h-10 border-gray-200 bg-white text-sm"
                  />
                </div>

                {/* Subtotal */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-gray-500">Estimasi Harga</Label>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-emerald-700">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Photo + Notes */}
      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          {/* Photo Upload */}
          <div className="flex flex-col gap-2">
            <Label className="text-gray-700">
              Foto Sampah <span className="text-red-500">*</span>
            </Label>
            {photoPreview ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={photoPreview}
                  alt="Preview sampah"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-400 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 hover:text-emerald-500"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Klik untuk unggah foto</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-gray-700">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk pengepul..."
              rows={6}
              className="resize-none border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary + Submit */}
      <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Total Estimasi Berat:{' '}
                <span className="font-bold text-gray-900">{totalWeight} kg</span>
              </p>
              <p className="text-sm text-gray-500">
                Total Estimasi Harga:{' '}
                <span className="text-lg font-bold text-emerald-700">{formatCurrency(totalPrice)}</span>
              </p>
            </div>

            <Separator className="sm:hidden" />

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="h-12 bg-gradient-to-r from-emerald-500 to-teal-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</>
              ) : (
                'Kirim Request Penjemputan'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </motion.div>
  );
}
