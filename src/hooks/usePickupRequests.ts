import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PickupRequest, DepositFormItem } from '@/lib/types';

// ── Query: Paginated pickup requests for a customer ─────────

interface UsePickupRequestsOptions {
  customerId: string | undefined;
  page: number;
  pageSize: number | 'all';
}

interface PickupRequestsResult {
  data: PickupRequest[];
  totalCount: number;
}

export function usePickupRequests({ customerId, page, pageSize }: UsePickupRequestsOptions) {
  return useQuery<PickupRequestsResult>({
    queryKey: ['pickup-requests', customerId, page, pageSize],
    queryFn: async () => {
      // Get total count
      const { count, error: countError } = await supabase
        .from('pickup_requests')
        .select('*', { count: 'exact', head: true })
        .eq('customers_id', customerId!);

      if (countError) throw countError;
      const totalCount = count ?? 0;

      // Build query
      let query = supabase
        .from('pickup_requests')
        .select('*')
        .eq('customers_id', customerId!)
        .order('created_at', { ascending: false });

      if (pageSize !== 'all') {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data as PickupRequest[]) ?? [],
        totalCount,
      };
    },
    enabled: !!customerId,
  });
}

// ── Mutation: Create pickup request + items ──────────────────

interface CreatePickupRequestInput {
  customerId: string;
  addressId: string;
  pickupDate: string;
  pickupTime: string;
  wastePhotoUrl: string | null;
  notes: string;
  items: DepositFormItem[];
}

export function useCreatePickupRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePickupRequestInput) => {
      // Calculate totals
      const totalWeight = input.items.reduce((sum, item) => sum + item.estimatedWeight, 0);
      const totalPrice = input.items.reduce((sum, item) => sum + item.subtotal, 0);

      // 1. INSERT pickup_request first to get the ID
      const { data: request, error: requestError } = await supabase
        .from('pickup_requests')
        .insert({
          customers_id: input.customerId,
          address_id: input.addressId,
          total_weight: totalWeight,
          total_price: totalPrice,
          pickup_date: input.pickupDate,
          pickup_time: input.pickupTime,
          waste_photo_url: input.wastePhotoUrl,
          status: 'pending',
          notes: input.notes || null,
        })
        .select('id')
        .single();

      if (requestError) throw requestError;

      // 2. INSERT all items with the request ID
      const itemsToInsert = input.items.map((item) => ({
        request_id: request.id,
        category_id: item.categoryId,
        estimated_weight: item.estimatedWeight,
        price_at_time: item.pricePerKg,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('pickup_request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-requests'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

// ── Mutation: Cancel a pending pickup request ────────────────

export function useCancelPickupRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('pickup_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('status', 'pending'); // Only allow cancelling pending requests

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-requests'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
  });
}

// ── Helper: Upload waste photo to Supabase Storage ───────────

export async function uploadWastePhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('waste-photos')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('waste-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
