import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AdminStats } from '@/lib/types';

/**
 * Fetches aggregated statistics for the admin overview dashboard.
 * - Total users (customers + partners) with subtotals
 * - Total weight collected (sum of real_weight from pickup_request_items)
 * - Total transaction value (sum of total_price from completed pickup_requests)
 */
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Count customers
      const { count: customerCount, error: custErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customers');
      if (custErr) throw custErr;

      // Count partners
      const { count: partnerCount, error: partErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'partners');
      if (partErr) throw partErr;

      // Sum real_weight from pickup_request_items (all completed requests)
      const { data: weightData, error: weightErr } = await supabase
        .from('pickup_request_items')
        .select('real_weight, request_id');
      if (weightErr) throw weightErr;

      const totalWeight = (weightData ?? []).reduce(
        (sum, row) => sum + (row.real_weight ?? 0),
        0,
      );

      // Sum total_price from completed pickup_requests
      const { data: txData, error: txErr } = await supabase
        .from('pickup_requests')
        .select('total_price')
        .eq('status', 'completed');
      if (txErr) throw txErr;

      const totalTxValue = (txData ?? []).reduce(
        (sum, row) => sum + (row.total_price ?? 0),
        0,
      );

      return {
        totalUsers: (customerCount ?? 0) + (partnerCount ?? 0),
        totalCustomers: customerCount ?? 0,
        totalPartners: partnerCount ?? 0,
        totalWeightCollected: totalWeight,
        totalTransactionValue: totalTxValue,
      };
    },
  });
}

/**
 * Fetches unverified partners (limit 5) for the admin overview dashboard.
 */
export function useUnverifiedPartnersPreview(limit = 5) {
  return useQuery({
    queryKey: ['admin-unverified-partners-preview', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, phone_number, avatar_url, role, is_verified, created_at')
        .eq('role', 'partners')
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Fetches pending pickup requests (limit 5) for the admin overview dashboard.
 */
export function usePendingRequestsPreview(limit = 5) {
  return useQuery({
    queryKey: ['admin-pending-requests-preview', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          id, customers_id, pickup_date, pickup_time, total_weight, status, created_at,
          customer:public_profiles!pickup_requests_customers_id_fkey(full_name),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city)
        `)
        .eq('status', 'pending')
        .is('partners_id', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}
