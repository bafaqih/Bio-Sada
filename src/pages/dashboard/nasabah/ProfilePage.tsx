import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, Shield, User, MapPin, Pencil, Plus, Trash2, Star } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';
import { useUploadAvatar } from '@/hooks/useProfile';
import type { Address } from '@/lib/types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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

export default function ProfilePage() {
  const { profile, session } = useAuthStore();
  const { data: addresses, isLoading: addressesLoading } = useAddresses(profile?.id);
  const uploadAvatar = useUploadAvatar();
  const deleteAddress = useDeleteAddress(profile?.id);
  const location = useLocation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Auto-open modal if navigated with state
  useEffect(() => {
    if (location.state && (location.state as any).openNewAddress) {
      setShowNewAddress(true);
      // Clear state so it doesn't re-trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB sebelum kompresi.');
      return;
    }

    try {
      await uploadAvatar.mutateAsync({ file, userId: profile.id, username: profile.username });
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <User className="h-6 w-6 text-emerald-600" />
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-gray-500">Kelola informasi pribadi dan alamat Anda.</p>
      </div>

      <Card className="border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-6">
          {/* ── Section 1: Avatar + Basic Info ──────────── */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-emerald-200">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
                  {getInitials(profile?.full_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="Ganti foto profil"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1 text-center sm:mt-2 sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
              <p className="text-sm text-gray-500">@{profile?.username ?? 'username'}</p>
              <Badge
                variant="secondary"
                className="mt-2 bg-emerald-100 text-emerald-700"
              >
                {ROLE_LABELS[profile?.role ?? ''] ?? profile?.role}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          {/* ── Section 2: Personal Info ────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Informasi Pribadi</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditProfile(true)}
                className="h-8 gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profil
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={User} label="Nama Lengkap" value={profile?.full_name ?? '-'} />
              <InfoRow icon={User} label="Username" value={profile?.username ?? '-'} />
              <InfoRow icon={Phone} label="Nomor Telepon" value={formatPhone(profile?.phone_number ?? null)} />
              <InfoRow icon={Mail} label="Email" value={session?.user.email ?? '-'} />
              <InfoRow icon={Shield} label="Role" value={ROLE_LABELS[profile?.role ?? ''] ?? '-'} />
            </div>
          </div>

          <Separator className="my-6" />

          {/* ── Section 3: Addresses ───────────────────── */}
          {profile?.role !== 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Alamat Saya</h3>
                {!(profile?.role === 'partners' && (addresses?.length ?? 0) >= 1) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewAddress(true)}
                    className="h-8 gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Alamat
                  </Button>
                )}
              </div>

              {addressesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-emerald-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                              {addr.is_primary && (
                                <Badge variant="secondary" className="h-5 bg-emerald-100 px-1.5 text-[10px] text-emerald-700">
                                  <Star className="mr-0.5 h-2.5 w-2.5" /> Utama
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{addr.address_detail}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {addr.city}, {addr.province} {addr.postal_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => setEditingAddress(addr)}
                            title="Edit Alamat"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {profile?.role !== 'partners' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteAddress(addr.id)}
                              disabled={deleteAddress.isPending}
                              title="Hapus Alamat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 py-6 text-center">
                  <p className="text-sm text-gray-500">Belum ada alamat tersimpan.</p>
                  <Button
                    variant="link"
                    className="mt-1 text-emerald-600"
                    onClick={() => setShowNewAddress(true)}
                  >
                    Tambah Alamat Sekarang
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
    </motion.div>
  );
}

// ── Reusable info row ────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-400 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
