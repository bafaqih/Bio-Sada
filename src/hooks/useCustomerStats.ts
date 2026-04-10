import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CustomerStats } from '@/lib/types';

/**
 * Fetches aggregated stats for the logged-in customer
 * from completed pickup requests.
 */
export function useCustomerStats(customerId: string | undefined) {
  return useQuery<CustomerStats>({
    queryKey: ['customer-stats', customerId],
    queryFn: async () => {
      if (!customerId) {
        return { totalWeight: 0, totalEarnings: 0, totalTransactions: 0 };
      }

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('total_weight, total_price')
        .eq('customers_id', customerId)
        .eq('status', 'completed');

      if (error) throw error;

      const stats: CustomerStats = {
        totalWeight: 0,
        totalEarnings: 0,
        totalTransactions: data?.length ?? 0,
      };

      for (const row of data ?? []) {
        stats.totalWeight += row.total_weight ?? 0;
        stats.totalEarnings += row.total_price ?? 0;
      }

      return stats;
    },
    enabled: !!customerId,
  });
}
