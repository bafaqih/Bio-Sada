import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

// ── Mutation: Update profile fields ──────────────────────────

type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'phone_number'>>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { profile, fetchProfile } = useAuthStore.getState();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!profile) throw new Error('No profile found');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh profile in auth store and query cache
      if (profile) {
        fetchProfile(profile.id);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

import { compressImage } from '@/lib/imageCompression';

// ── Mutation: Upload avatar ──────────────────────────────────

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId, username }: { file: File; userId: string; username: string | null }) => {
      const compressedFile = await compressImage(file);
      const ext = compressedFile.name.split('.').pop() || 'webp';
      const nameLabel = username ? username : userId;
      const fileName = `${userId}/${Date.now()}-${nameLabel}.${ext}`;

      // Upload to Supabase Storage (overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: (_url, variables) => {
      // Refresh profile in auth store
      const { fetchProfile } = useAuthStore.getState();
      fetchProfile(variables.userId);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
