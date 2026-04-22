import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LandingStats {
  totalWasteCollected: number;
  totalActiveCustomers: number;
  totalVerifiedPartners: number;
}

/**
 * Public stats hook for the landing page.
 * Fetches aggregated counts without requiring authentication.
 */
export function useLandingStats() {
  return useQuery<LandingStats>({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      // Count active customers
      const { count: customerCount, error: custErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customers');
      if (custErr) throw custErr;

      // Count verified partners
      const { count: partnerCount, error: partErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'partners')
        .eq('is_verified', true);
      if (partErr) throw partErr;

      // Sum real_weight from completed pickup_request_items
      const { data: weightData, error: weightErr } = await supabase
        .from('pickup_request_items')
        .select('real_weight');
      if (weightErr) throw weightErr;

      const totalWeight = (weightData ?? []).reduce(
        (sum, row) => sum + (row.real_weight ?? 0),
        0,
      );

      return {
        totalWasteCollected: totalWeight,
        totalActiveCustomers: customerCount ?? 0,
        totalVerifiedPartners: partnerCount ?? 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
