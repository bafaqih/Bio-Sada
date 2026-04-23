import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LandingStats {
  total_waste: number;
  total_customers: number;
  total_partners: number;
}

/**
 * Public stats hook for the landing page.
 * Fetches aggregated counts via RPC for performance.
 */
export function useLandingStats() {
  return useQuery<LandingStats>({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_landing_stats');
      
      if (error) {
        console.error('Error fetching landing stats:', error);
        throw error;
      }

      return data as LandingStats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
