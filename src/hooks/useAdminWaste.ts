import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WasteCategory } from '@/lib/types';
import { compressImage } from '@/lib/imageCompression';

interface UseAllWasteCategoriesOptions {
  page: number;
  pageSize: number | 'all';
}

interface AllWasteCategoriesResult {
  data: WasteCategory[];
  totalCount: number;
}

/**
 * Fetches ALL waste categories (active + inactive) with pagination.
 * Used only by admin in the waste list CRUD page.
 */
export function useAllWasteCategories({ page, pageSize }: UseAllWasteCategoriesOptions) {
  return useQuery<AllWasteCategoriesResult>({
    queryKey: ['admin-waste-categories', page, pageSize],
    queryFn: async () => {
      // Count total (all statuses)
      const { count, error: countError } = await supabase
        .from('waste_categories')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      const totalCount = count ?? 0;

      // Data query
      let query = supabase
        .from('waste_categories')
        .select('*')
        .order('name', { ascending: true });

      if (pageSize !== 'all') {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data as WasteCategory[]) ?? [],
        totalCount,
      };
    },
  });
}

// ── Create Waste Category ────────────────────────────────────

interface CreateWasteInput {
  name: string;
  price_per_kg: number;
  unit: string;
  description: string;
  image: File;
  status: 'active' | 'inactive';
}

export function useCreateWasteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWasteInput) => {
      // 1. Compress and upload image
      const compressed = await compressImage(input.image);
      const ext = compressed.name.split('.').pop() || 'webp';
      const fileName = `waste/${Date.now()}-${input.name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('waste-photos')
        .upload(fileName, compressed, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('waste-photos')
        .getPublicUrl(fileName);

      // 2. Insert record
      const { data, error } = await supabase
        .from('waste_categories')
        .insert({
          name: input.name,
          price_per_kg: input.price_per_kg,
          unit: input.unit,
          description: input.description,
          image_url: urlData.publicUrl,
          status: input.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories-active'] });
    },
  });
}

// ── Update Waste Category ────────────────────────────────────

interface UpdateWasteInput {
  id: string;
  name: string;
  price_per_kg: number;
  unit: string;
  description: string;
  image?: File; // optional — only if changing image
  status: 'active' | 'inactive';
}

export function useUpdateWasteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWasteInput) => {
      let imageUrl: string | undefined;

      // Upload new image if provided
      if (input.image) {
        const compressed = await compressImage(input.image);
        const ext = compressed.name.split('.').pop() || 'webp';
        const fileName = `waste/${Date.now()}-${input.name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('waste-photos')
          .upload(fileName, compressed, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('waste-photos')
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Update record
      const updatePayload: Record<string, unknown> = {
        name: input.name,
        price_per_kg: input.price_per_kg,
        unit: input.unit,
        description: input.description,
        status: input.status,
      };
      if (imageUrl) updatePayload.image_url = imageUrl;

      const { data, error } = await supabase
        .from('waste_categories')
        .update(updatePayload)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories-active'] });
    },
  });
}

// ── Delete Waste Category ────────────────────────────────────

export function useDeleteWasteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('waste_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories'] });
      queryClient.invalidateQueries({ queryKey: ['waste-categories-active'] });
    },
  });
}
