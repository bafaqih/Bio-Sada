import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useProfile';

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

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { profile } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Sync form with current profile when modal opens
  useEffect(() => {
    if (open && profile) {
      setFullName(profile.full_name ?? '');
      // Display without '62' prefix for editing
      const phone = profile.phone_number ?? '';
      setPhoneNumber(phone.startsWith('62') ? phone.slice(2) : phone);
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Nama lengkap wajib diisi.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim(),
        phone_number: phoneNumber ? `62${phoneNumber.replace(/^0+/, '')}` : null,
      });
      toast.success('Profil berhasil diperbarui!');
      onOpenChange(false);
    } catch {
      toast.error('Gagal memperbarui profil.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">Edit Profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-fullname" className="text-gray-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="h-11 border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-phone" className="text-gray-700">
              Nomor Telepon
            </Label>
            <div className="flex">
              <div className="flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3">
                <span className="text-sm text-gray-500">+62</span>
              </div>
              <Input
                id="edit-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="812xxxxxxxx"
                className="h-11 rounded-l-none border-gray-200 bg-white/70 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20"
              />
            </div>
          </div>

          {/* Read-only fields info */}
          <p className="text-xs text-gray-400">
            Email, username, dan role tidak dapat diubah dari sini.
          </p>

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
              disabled={updateProfile.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
            >
              {updateProfile.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
