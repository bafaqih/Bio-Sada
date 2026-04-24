import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/**
 * Subscribes to Supabase Realtime for Admin notifications.
 * Detects new unverified partners and new pickup requests.
 *
 * @param enabled - Whether the subscription should be active
 */
export function useRealtimeAdmin(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('admin-realtime-notifications')
      // 1. Listen for new Partners
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const newProfile = payload.new as { role?: string; is_verified?: boolean; full_name?: string };
          if (newProfile.role === 'partners' && !newProfile.is_verified) {
            toast.info('Ada mitra baru mendaftar!', {
              description: `${newProfile.full_name} menunggu verifikasi.`,
              duration: 6000,
            });
            queryClient.invalidateQueries({ queryKey: ['unverified-partners-preview'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          }
        }
      )
      // 2. Listen for new Pickup Requests (Pending)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pickup_requests',
        },
        (payload) => {
          const newRequest = payload.new as { status?: string };
          if (newRequest.status === 'pending') {
            toast.info('Ada permintaan penjemputan baru!', {
              description: 'Cek tabel permintaan pending.',
              duration: 5000,
            });
            queryClient.invalidateQueries({ queryKey: ['pending-requests-preview'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}
