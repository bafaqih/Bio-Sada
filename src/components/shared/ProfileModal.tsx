import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Camera, Mail, Phone, Shield, User, MapPin, Pencil, Plus, Trash2, Star } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';
import { useUploadAvatar } from '@/hooks/useProfile';
import type { Address } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import EditProfileModal from '@/components/shared/EditProfileModal';
import AddressModal from '@/components/shared/AddressModal';

// ── Helpers ──────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_LABELS: Record<string, string> = {
  customers: 'Nasabah',
  partners: 'Mitra Pengepul',
  admin: 'Administrator',
};

// ── Component ────────────────────────────────────────────────

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { profile } = useAuthStore();
  const { data: addresses, isLoading: addressesLoading } = useAddresses(profile?.id);
  const uploadAvatar = useUploadAvatar();
  const deleteAddress = useDeleteAddress(profile?.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB.');
      return;
    }

    try {
      await uploadAvatar.mutateAsync({ file, userId: profile.id });
      toast.success('Foto profil berhasil diperbarui!');
    } catch {
      toast.error('Gagal mengunggah foto profil.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress.mutateAsync(addressId);
      toast.success('Alamat berhasil dihapus.');
    } catch {
      toast.error('Gagal menghapus alamat.');
    }
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    return phone.startsWith('62') ? `+${phone}` : phone;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Profil Saya</DialogTitle>
          </DialogHeader>

          {/* ── Section 1: Avatar + Basic Info ──────────── */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-emerald-200">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                  {getInitials(profile?.full_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
                aria-label="Ganti foto profil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{profile?.username ?? profile?.full_name}</p>
              <Badge
                variant="secondary"
                className="mt-1 bg-emerald-50 text-emerald-700"
              >
                {ROLE_LABELS[profile?.role ?? ''] ?? profile?.role}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* ── Section 2: Personal Info ────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Informasi Pribadi</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditProfile(true)}
                className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="space-y-3">
              <InfoRow icon={User} label="Nama Lengkap" value={profile?.full_name ?? '-'} />
              <InfoRow icon={User} label="Username" value={profile?.username ?? '-'} />
              <InfoRow icon={Phone} label="Nomor Telepon" value={formatPhone(profile?.phone_number ?? null)} />
              <InfoRow icon={Mail} label="Email" value={profile?.id ? '(dari akun Supabase)' : '-'} />
              <InfoRow icon={Shield} label="Role" value={ROLE_LABELS[profile?.role ?? ''] ?? '-'} />
            </div>
          </div>

          <Separator />

          {/* ── Section 3: Addresses ───────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Alamat Saya</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewAddress(true)}
                className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="h-3 w-3" /> Tambah
              </Button>
            </div>

            {addressesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{addr.label}</span>
                            {addr.is_primary && (
                              <Badge variant="secondary" className="h-5 bg-emerald-100 px-1.5 text-[10px] text-emerald-700">
                                <Star className="mr-0.5 h-2.5 w-2.5" /> Utama
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">{addr.address_detail}</p>
                          <p className="text-xs text-gray-400">
                            {addr.city}, {addr.province} {addr.postal_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-emerald-600"
                          onClick={() => setEditingAddress(addr)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteAddress(addr.id)}
                          disabled={deleteAddress.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">Belum ada alamat tersimpan.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <EditProfileModal
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
      />
      <AddressModal
        open={showNewAddress || !!editingAddress}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewAddress(false);
            setEditingAddress(null);
          }
        }}
        address={editingAddress}
      />
    </>
  );
}

// ── Reusable info row ────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="truncate text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}
