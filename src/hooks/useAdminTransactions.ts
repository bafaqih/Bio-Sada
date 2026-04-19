import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RequestStatus, TransactionWithDetails, PickupRequestItem } from '@/lib/types';

// ── All Transactions (with optional status filter) ───────────

interface UseAllTransactionsOptions {
  status?: RequestStatus | 'all';
  page: number;
  pageSize: number | 'all';
}

interface AllTransactionsResult {
  data: TransactionWithDetails[];
  totalCount: number;
}

export function useAllTransactions({ status, page, pageSize }: UseAllTransactionsOptions) {
  return useQuery<AllTransactionsResult>({
    queryKey: ['admin-transactions', status, page, pageSize],
    queryFn: async () => {
      // Count query
      let countQuery = supabase
        .from('pickup_requests')
        .select('*', { count: 'exact', head: true });

      if (status && status !== 'all') {
        countQuery = countQuery.eq('status', status);
      }

      const { count, error: countErr } = await countQuery;
      if (countErr) throw countErr;
      const totalCount = count ?? 0;

      // Data query with joins
      let query = supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number),
          partner:profiles!pickup_requests_partners_id_fkey(full_name, phone_number),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (pageSize !== 'all') {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data ?? []).map((r) => ({
          ...r,
          customer: r.customer ?? undefined,
          partner: r.partner ?? undefined,
          address: r.address ?? undefined,
        })) as TransactionWithDetails[],
        totalCount,
      };
    },
  });
}

// ── Transaction Detail ───────────────────────────────────────

export function useTransactionDetail(transactionId: string | undefined) {
  return useQuery<TransactionWithDetails | null>({
    queryKey: ['admin-transaction-detail', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number),
          partner:profiles!pickup_requests_partners_id_fkey(full_name, phone_number),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      // Fetch items
      const { data: items, error: itemsErr } = await supabase
        .from('pickup_request_items')
        .select('*, waste_categories(name, unit)')
        .eq('request_id', transactionId);

      if (itemsErr) throw itemsErr;

      return {
        ...data,
        customer: data.customer ?? undefined,
        partner: data.partner ?? undefined,
        address: data.address ?? undefined,
        items: (items ?? []) as PickupRequestItem[],
      } as TransactionWithDetails;
    },
    enabled: !!transactionId,
  });
}
