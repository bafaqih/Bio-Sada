import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PartnerStats } from '@/lib/types';

/**
 * Fetches aggregated stats for the logged-in partner
 * from completed pickup requests where they are assigned.
 */
export function usePartnerStats(partnerId: string | undefined) {
  return useQuery<PartnerStats>({
    queryKey: ['partner-stats', partnerId],
    queryFn: async () => {
      if (!partnerId) {
        return { totalCompletedTasks: 0, totalWeightCollected: 0, totalCustomersServed: 0 };
      }

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('total_weight, customers_id')
        .eq('partners_id', partnerId)
        .eq('status', 'completed');

      if (error) throw error;

      const uniqueCustomers = new Set<string>();
      let totalWeight = 0;

      for (const row of data ?? []) {
        totalWeight += row.total_weight ?? 0;
        if (row.customers_id) uniqueCustomers.add(row.customers_id);
      }

      return {
        totalCompletedTasks: data?.length ?? 0,
        totalWeightCollected: totalWeight,
        totalCustomersServed: uniqueCustomers.size,
      };
    },
    enabled: !!partnerId,
  });
}
