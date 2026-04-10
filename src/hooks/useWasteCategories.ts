import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WasteCategory } from '@/lib/types';

interface UseWasteCategoriesOptions {
  page: number;
  pageSize: number | 'all';
}

interface WasteCategoriesResult {
  data: WasteCategory[];
  totalCount: number;
}

/**
 * Fetches active waste categories with pagination support.
 * Supports page sizes: 10, 20, 50, 100, or 'all'.
 */
export function useWasteCategories({ page, pageSize }: UseWasteCategoriesOptions) {
  return useQuery<WasteCategoriesResult>({
    queryKey: ['waste-categories', page, pageSize],
    queryFn: async () => {
      // First get total count
      const { count, error: countError } = await supabase
        .from('waste_categories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (countError) throw countError;
      const totalCount = count ?? 0;

      // Build data query
      let query = supabase
        .from('waste_categories')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      // Apply pagination unless 'all'
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

/**
 * Fetches all active waste categories (no pagination).
 * Used for dropdown selections in forms.
 */
export function useActiveWasteCategories() {
  return useQuery<WasteCategory[]>({
    queryKey: ['waste-categories-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;
      return (data as WasteCategory[]) ?? [];
    },
  });
}
