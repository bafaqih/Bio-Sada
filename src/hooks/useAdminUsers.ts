import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProfileWithCreatedAt, ProfileWithAddress } from '@/lib/types';

// ── Partner List ─────────────────────────────────────────────

interface UsePartnerListOptions {
  verified: boolean;
  page: number;
  pageSize: number | 'all';
}

interface PartnerListResult {
  data: ProfileWithCreatedAt[];
  totalCount: number;
}

export function usePartnerList({ verified, page, pageSize }: UsePartnerListOptions) {
  return useQuery<PartnerListResult>({
    queryKey: ['admin-partners', verified, page, pageSize],
    queryFn: async () => {
      // Count
      const { count, error: countErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'partners')
        .eq('is_verified', verified);
      if (countErr) throw countErr;
      const totalCount = count ?? 0;

      // Data
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, phone_number, email, avatar_url, role, is_verified, created_at')
        .eq('role', 'partners')
        .eq('is_verified', verified)
        .order('created_at', { ascending: false });

      if (pageSize !== 'all') {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data ?? []) as ProfileWithCreatedAt[],
        totalCount,
      };
    },
  });
}

// ── Customer List ────────────────────────────────────────────

interface UseCustomerListOptions {
  page: number;
  pageSize: number | 'all';
}

interface CustomerListResult {
  data: ProfileWithCreatedAt[];
  totalCount: number;
}

export function useCustomerList({ page, pageSize }: UseCustomerListOptions) {
  return useQuery<CustomerListResult>({
    queryKey: ['admin-customers', page, pageSize],
    queryFn: async () => {
      const { count, error: countErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customers');
      if (countErr) throw countErr;
      const totalCount = count ?? 0;

      let query = supabase
        .from('profiles')
        .select('id, full_name, username, phone_number, email, avatar_url, role, is_verified, created_at')
        .eq('role', 'customers')
        .order('created_at', { ascending: false });

      if (pageSize !== 'all') {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data ?? []) as ProfileWithCreatedAt[],
        totalCount,
      };
    },
  });
}

// ── User Detail (with addresses) ─────────────────────────────

export function useUserDetail(userId: string | undefined) {
  return useQuery<ProfileWithAddress | null>({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, username, phone_number, email, avatar_url, role, is_verified, created_at,
          addresses(*)
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      // Ensure addresses are sorted if needed, though usually frontend sorts or finds primary
      const addresses = data.addresses ?? [];
      addresses.sort((a: any, b: any) => (b.is_primary ? 1 : -1) - (a.is_primary ? 1 : -1));

      return {
        ...(data as any),
        addresses,
      } as ProfileWithAddress;
    },
    enabled: !!userId,
  });
}

// ── User Stats (for detail pages) ────────────────────────────

interface UserDetailStats {
  totalWeight: number;
  totalEarnings: number;
  totalTransactions: number;
}

export function useUserDetailStats(userId: string | undefined, role: string | undefined) {
  return useQuery<UserDetailStats>({
    queryKey: ['admin-user-stats', userId, role],
    queryFn: async () => {
      if (!userId) return { totalWeight: 0, totalEarnings: 0, totalTransactions: 0 };

      const filterField = role === 'partners' ? 'partners_id' : 'customers_id';

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('total_weight, total_price')
        .eq(filterField, userId)
        .eq('status', 'completed');

      if (error) throw error;

      return {
        totalWeight: (data ?? []).reduce((sum, r) => sum + (r.total_weight ?? 0), 0),
        totalEarnings: (data ?? []).reduce((sum, r) => sum + (r.total_price ?? 0), 0),
        totalTransactions: data?.length ?? 0,
      };
    },
    enabled: !!userId,
  });
}

// ── Approve Partner ──────────────────────────────────────────

export function useApprovePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unverified-partners-preview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ── Reject Partner (set is_verified = false, no deletion) ────

export function useRejectPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      // Keep is_verified as false — no data change needed
      // This mutation exists for UI pattern consistency
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: false })
        .eq('id', partnerId)
        .eq('role', 'partners');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unverified-partners-preview'] });
    },
  });
}
