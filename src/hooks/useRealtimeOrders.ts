import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import incomingRequestSound from '@/assets/sounds/IncomingRequest.mp3';

/**
 * Subscribes to Supabase Realtime channel for pickup_requests table.
 * When a new pending request is inserted or status changes,
 * it invalidates TanStack Query cache and plays a notification sound.
 *
 * @param enabled - Whether the subscription should be active
 */
export function useRealtimeOrders(enabled: boolean) {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Pre-load audio element
    audioRef.current = new Audio(incomingRequestSound);
    audioRef.current.volume = 0.7;

    const channel = supabase
      .channel('partner-realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_requests',
        },
        (payload) => {
          // Invalidate all related queries so UI auto-updates
          queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
          queryClient.invalidateQueries({ queryKey: ['partner-active-tasks'] });
          queryClient.invalidateQueries({ queryKey: ['partner-stats'] });
          queryClient.invalidateQueries({ queryKey: ['partner-task-history'] });

          // Play sound only for new pending requests
          if (
            payload.eventType === 'INSERT' &&
            (payload.new as { status?: string })?.status === 'pending'
          ) {
            toast.info('Ada order penjemputan baru!', {
              description: 'Segera cek tabel order masuk.',
              duration: 5000,
            });
            playNotificationSound();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Browser may block autoplay before user interaction — silently ignore
        });
      }
    } catch {
      // Fallback: ignore audio errors
    }
  };
}
