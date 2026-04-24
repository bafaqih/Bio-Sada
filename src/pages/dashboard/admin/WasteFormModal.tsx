import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ImagePlus } from 'lucide-react';

import type { WasteCategory } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import { useCreateWasteCategory, useUpdateWasteCategory } from '@/hooks/useAdminWaste';

interface WasteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, modal is in "edit" mode. If null, "create" mode. */
  editData?: WasteCategory | null;
}

export default function WasteFormModal({
  open,
  onOpenChange,
  editData,
}: WasteFormModalProps) {
  const isEdit = !!editData;
  const createMutation = useCreateWasteCategory();
  const updateMutation = useUpdateWasteCategory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(true); // true = active
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setPricePerKg(String(editData.price_per_kg));
        setUnit(editData.unit);
        setDescription(editData.description ?? '');
        setStatus(editData.status === 'active');
        setImagePreview(editData.image_url);
        setImageFile(null);
      } else {
        setName('');
        setPricePerKg('');
        setUnit('');
        setDescription('');
        setStatus(true);
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [open, editData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !pricePerKg || !unit.trim() || !description.trim()) {
      toast.error('Semua field wajib diisi.');
      return;
    }

    if (!isEdit && !imageFile) {
      toast.error('Gambar wajib diunggah.');
      return;
    }

    const price = parseFloat(pricePerKg);
    if (isNaN(price) || price <= 0) {
      toast.error('Harga per kg harus berupa angka positif.');
      return;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: editData!.id,
          name: name.trim(),
          price_per_kg: price,
          unit: unit.trim(),
          description: description.trim(),
          image: imageFile ?? undefined,
          status: status ? 'active' : 'inactive',
        });
        toast.success('Jenis sampah berhasil diperbarui.');
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          price_per_kg: price,
          unit: unit.trim(),
          description: description.trim(),
          image: imageFile!,
          status: status ? 'active' : 'inactive',
        });
        toast.success('Jenis sampah berhasil ditambahkan.');
      }
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="waste-name" className="text-sm font-medium text-gray-700">
              Nama Jenis <span className="text-red-500">*</span>
            </Label>
            <Input
              id="waste-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Plastik PET"
              className="border-gray-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Price per kg */}
          <div className="space-y-2">
            <Label htmlFor="waste-price" className="text-sm font-medium text-gray-700">
              Harga per Kg (Rp) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="waste-price"
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              placeholder="e.g. 3000"
              min="0"
              step="100"
              className="border-gray-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="waste-unit" className="text-sm font-medium text-gray-700">
              Satuan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="waste-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. kg"
              className="border-gray-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="waste-desc" className="text-sm font-medium text-gray-700">
              Deskripsi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="waste-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat jenis sampah..."
              className="min-h-20 border-gray-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Gambar {!isEdit && <span className="text-red-500">*</span>}
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
            >
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    src={imagePreview}
                    alt="Preview"
                    className="h-28 w-28 rounded-lg object-cover"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2 text-gray-400"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Klik untuk upload gambar</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <p className="text-xs text-gray-400">Klik area di atas untuk mengganti gambar</p>
            )}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Status Aktif</p>
              <p className="text-xs text-gray-400">
                {status ? 'Jenis sampah akan ditampilkan ke pengguna' : 'Jenis sampah disembunyikan dari pengguna'}
              </p>
            </div>
            <Switch
              checked={status}
              onCheckedChange={setStatus}
              className="border-transparent data-checked:border-emerald-600 data-checked:bg-emerald-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-gray-500"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {isPending ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : isEdit ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Jenis'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
