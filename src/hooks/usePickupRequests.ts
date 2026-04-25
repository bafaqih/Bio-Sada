import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PickupRequest, DepositFormItem, PickupRequestWithDetails, PickupRequestItem } from '@/lib/types';

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
 
// ── Query: Single deposit detail for customer ────────────────
 
export function useDepositDetail(requestId: string | undefined) {
  return useQuery<PickupRequestWithDetails | null>({
    queryKey: ['deposit-detail', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          customer:public_profiles!pickup_requests_customers_id_fkey(full_name, phone_number, avatar_url),
          partner:public_profiles!pickup_requests_partners_id_fkey(full_name, phone_number, avatar_url),
          address:addresses!pickup_requests_address_id_fkey(address_detail, city, latitude, longitude)
        `)
        .eq('id', requestId!)
        .single();
 
      if (error) throw error;
 
      // Fetch items
      const { data: items, error: itemsError } = await supabase
        .from('pickup_request_items')
        .select('*, waste_categories(name, unit)')
        .eq('request_id', requestId!);
 
      if (itemsError) throw itemsError;
 
      return {
        ...data,
        customer: data.customer ?? undefined,
        partner: data.partner ?? undefined,
        address: data.address ?? undefined,
        items: (items ?? []) as PickupRequestItem[],
      } as PickupRequestWithDetails;
    },
    enabled: !!requestId,
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

import { compressImage } from '@/lib/imageCompression';

export async function uploadWastePhoto(file: File, userId: string, username: string | null): Promise<string> {
  const compressedFile = await compressImage(file);
  const ext = compressedFile.name.split('.').pop() || 'webp';
  const nameLabel = username ? username : userId;
  const fileName = `${userId}/${Date.now()}-${nameLabel}.${ext}`;

  const { error } = await supabase.storage
    .from('waste-photos')
    .upload(fileName, compressedFile);

  if (error) throw error;

  const { data } = supabase.storage
    .from('waste-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
