import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PickupRequestWithDetails, PickupRequestItem } from '@/lib/types';

// ── Query: Pending requests for partner dashboard ────────────

export function usePendingRequests() {
  return useQuery<PickupRequestWithDetails[]>({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      // Fetch pending pickup requests with customer and address info
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city, latitude, longitude)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch items for each request
      const requestIds = (data ?? []).map((r) => r.id);
      let itemsMap: Record<string, PickupRequestItem[]> = {};

      if (requestIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('pickup_request_items')
          .select('*, waste_categories(name, unit)')
          .in('request_id', requestIds);

        if (itemsError) throw itemsError;

        itemsMap = (items ?? []).reduce(
          (acc, item) => {
            if (!acc[item.request_id]) acc[item.request_id] = [];
            acc[item.request_id].push(item as PickupRequestItem);
            return acc;
          },
          {} as Record<string, PickupRequestItem[]>,
        );
      }

      return (data ?? []).map((r) => ({
        ...r,
        customer: r.customer ?? undefined,
        address: r.address ?? undefined,
        items: itemsMap[r.id] ?? [],
      })) as PickupRequestWithDetails[];
    },
  });
}

// ── Mutation: Accept a pending request ────────────────────────

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, partnerId }: { requestId: string; partnerId: string }) => {
      const { error } = await supabase
        .from('pickup_requests')
        .update({
          status: 'accepted',
          partners_id: partnerId,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['partner-active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['partner-stats'] });
    },
  });
}

// ── Query: Active tasks for this partner ─────────────────────

export function usePartnerActiveTasks(partnerId: string | undefined) {
  return useQuery<PickupRequestWithDetails[]>({
    queryKey: ['partner-active-tasks', partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city, latitude, longitude)
        `)
        .eq('partners_id', partnerId!)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false });

      if (error) throw error;

      // Fetch items
      const requestIds = (data ?? []).map((r) => r.id);
      let itemsMap: Record<string, PickupRequestItem[]> = {};

      if (requestIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('pickup_request_items')
          .select('*, waste_categories(name, unit)')
          .in('request_id', requestIds);

        if (itemsError) throw itemsError;

        itemsMap = (items ?? []).reduce(
          (acc, item) => {
            if (!acc[item.request_id]) acc[item.request_id] = [];
            acc[item.request_id].push(item as PickupRequestItem);
            return acc;
          },
          {} as Record<string, PickupRequestItem[]>,
        );
      }

      return (data ?? []).map((r) => ({
        ...r,
        customer: r.customer ?? undefined,
        address: r.address ?? undefined,
        items: itemsMap[r.id] ?? [],
      })) as PickupRequestWithDetails[];
    },
    enabled: !!partnerId,
  });
}

// ── Query: Task history (completed/cancelled) ────────────────

interface UsePartnerTaskHistoryOptions {
  partnerId: string | undefined;
  page: number;
  pageSize: number | 'all';
}

interface PartnerTaskHistoryResult {
  data: PickupRequestWithDetails[];
  totalCount: number;
}

export function usePartnerTaskHistory({ partnerId, page, pageSize }: UsePartnerTaskHistoryOptions) {
  return useQuery<PartnerTaskHistoryResult>({
    queryKey: ['partner-task-history', partnerId, page, pageSize],
    queryFn: async () => {
      // Count
      const { count, error: countError } = await supabase
        .from('pickup_requests')
        .select('*', { count: 'exact', head: true })
        .eq('partners_id', partnerId!)
        .in('status', ['completed', 'cancelled']);

      if (countError) throw countError;
      const totalCount = count ?? 0;

      // Data
      let query = supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city, latitude, longitude)
        `)
        .eq('partners_id', partnerId!)
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false, nullsFirst: false });

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
          address: r.address ?? undefined,
        })) as PickupRequestWithDetails[],
        totalCount,
      };
    },
    enabled: !!partnerId,
  });
}

// ── Query: Single task detail ────────────────────────────────

export function useTaskDetail(taskId: string | undefined) {
  return useQuery<PickupRequestWithDetails | null>({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:profiles!pickup_requests_customers_id_fkey(full_name, phone_number, avatar_url),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city, latitude, longitude)
        `)
        .eq('id', taskId!)
        .single();

      if (error) throw error;

      // Fetch items
      const { data: items, error: itemsError } = await supabase
        .from('pickup_request_items')
        .select('*, waste_categories(name, unit)')
        .eq('request_id', taskId!);

      if (itemsError) throw itemsError;

      return {
        ...data,
        customer: data.customer ?? undefined,
        address: data.address ?? undefined,
        items: (items ?? []) as PickupRequestItem[],
      } as PickupRequestWithDetails;
    },
    enabled: !!taskId,
  });
}

// ── Mutation: Cancel an accepted request (return to pending) ─

export function useCancelAcceptedRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('pickup_requests')
        .update({
          status: 'pending',
          partners_id: null,
          accepted_at: null,
        })
        .eq('id', requestId)
        .eq('status', 'accepted');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['partner-active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      queryClient.invalidateQueries({ queryKey: ['partner-stats'] });
    },
  });
}

// ── Mutation: Weigh items (update real_weight + subtotal) ────

interface WeighItemInput {
  itemId: string;
  realWeight: number;
  priceAtTime: number;
}

export function useWeighItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: WeighItemInput[]) => {
      for (const item of items) {
        const subtotal = item.realWeight * item.priceAtTime;
        const { error, data } = await supabase
          .from('pickup_request_items')
          .update({
            real_weight: item.realWeight,
            subtotal,
          })
          .eq('id', item.itemId)
          .select();

        if (error) throw error;
        // RLS silent failure check
        if (!data || data.length === 0) {
          throw new Error(`Gagal update item ${item.itemId}. Pastikan kebijakan RLS (Row Level Security) mengizinkan UPDATE.`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
    },
  });
}

// ── Mutation: Complete a request (finalization) ──────────────

export function useCompleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      // 1. Fetch all items to calculate total_price
      const { data: items, error: fetchError } = await supabase
        .from('pickup_request_items')
        .select('real_weight, price_at_time, subtotal')
        .eq('request_id', requestId);

      if (fetchError) throw fetchError;

      const totalWeight = (items ?? []).reduce((sum, i) => sum + (i.real_weight ?? 0), 0);
      const totalPrice = (items ?? []).reduce((sum, i) => sum + (i.subtotal ?? 0), 0);

      // 2. Update the request header
      const { error, data } = await supabase
        .from('pickup_requests')
        .update({
          status: 'completed',
          total_weight: totalWeight,
          total_price: totalPrice,
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'accepted')
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Gagal update status tugas. Kemungkinan terhalang kebijakan RLS.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['partner-task-history'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail'] });
      queryClient.invalidateQueries({ queryKey: ['partner-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
}
