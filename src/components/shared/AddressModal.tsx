import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses';
import type { Address } from '@/lib/types';

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

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, we're editing; otherwise creating a new address */
  address?: Address | null;
}

const EMPTY_FORM = {
  label: '',
  address_detail: '',
  city: '',
  province: '',
  postal_code: '',
  latitude: '',
  longitude: '',
  is_primary: false,
};

export default function AddressModal({ open, onOpenChange, address }: AddressModalProps) {
  const { profile } = useAuthStore();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress(profile?.id);

  const isEditing = !!address;

  const [form, setForm] = useState(EMPTY_FORM);

  // Sync form when modal opens
  useEffect(() => {
    if (open && address) {
      setForm({
        label: address.label,
        address_detail: address.address_detail,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        latitude: address.latitude?.toString() ?? '',
        longitude: address.longitude?.toString() ?? '',
        is_primary: address.is_primary,
      });
    } else if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open, address]);

  const updateField = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.label.trim() || !form.address_detail.trim() || !form.city.trim()) {
      toast.error('Label, detail alamat, dan kota wajib diisi.');
      return;
    }

    const payload = {
      label: form.label.trim(),
      address_detail: form.address_detail.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postal_code: form.postal_code.trim(),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      is_primary: form.is_primary,
    };

    try {
      if (isEditing && address) {
        await updateAddress.mutateAsync({ id: address.id, ...payload });
        toast.success('Alamat berhasil diperbarui!');
      } else {
        await createAddress.mutateAsync({
          ...payload,
          profile_id: profile!.id,
        });
        toast.success('Alamat baru berhasil ditambahkan!');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Gagal memperbarui alamat.' : 'Gagal menambahkan alamat.');
    }
  };

  const isPending = createAddress.isPending || updateAddress.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Alamat' : 'Tambah Alamat Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Label */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-label" className="text-gray-700">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addr-label"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="cth: Rumah, Kantor, Gudang"
              className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>

          {/* Address Detail */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-detail" className="text-gray-700">
              Detail Alamat <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addr-detail"
              value={form.address_detail}
              onChange={(e) => updateField('address_detail', e.target.value)}
              placeholder="Jalan, RT/RW, No. Rumah"
              className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>

          {/* City + Province */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="addr-city" className="text-gray-700">
                Kota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Malang"
                className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addr-province" className="text-gray-700">Provinsi</Label>
              <Input
                id="addr-province"
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                placeholder="Jawa Timur"
                className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="addr-postal" className="text-gray-700">Kode Pos</Label>
            <Input
              id="addr-postal"
              value={form.postal_code}
              onChange={(e) => updateField('postal_code', e.target.value)}
              placeholder="65141"
              className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>

          {/* Lat / Lng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="addr-lat" className="text-gray-700">Latitude</Label>
              <Input
                id="addr-lat"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                placeholder="-7.977"
                className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addr-lng" className="text-gray-700">Longitude</Label>
              <Input
                id="addr-lng"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                placeholder="112.634"
                className="h-11 border-gray-200 bg-white/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
              />
            </div>
          </div>

          {/* Primary Toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={(e) => updateField('is_primary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Jadikan alamat utama</span>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-500"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Alamat'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
