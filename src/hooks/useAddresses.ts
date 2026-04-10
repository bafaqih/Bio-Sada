import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Address } from '@/lib/types';

/**
 * Fetches all addresses for a given profile.
 */
export function useAddresses(profileId: string | undefined) {
  return useQuery<Address[]>({
    queryKey: ['addresses', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', profileId!)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return (data as Address[]) ?? [];
    },
    enabled: !!profileId,
  });
}

type AddressInput = Omit<Address, 'id'>;
type AddressUpdate = Partial<Omit<Address, 'id' | 'profile_id'>> & { id: string };

/**
 * Mutation to create a new address.
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddressInput) => {
      // If this is set as primary, unset all other primaries first
      if (input.is_primary) {
        await supabase
          .from('addresses')
          .update({ is_primary: false })
          .eq('profile_id', input.profile_id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Address;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses', variables.profile_id] });
    },
  });
}

/**
 * Mutation to update an existing address.
 */
export function useUpdateAddress(profileId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AddressUpdate) => {
      // If setting as primary, unset all other primaries first
      if (updates.is_primary && profileId) {
        await supabase
          .from('addresses')
          .update({ is_primary: false })
          .eq('profile_id', profileId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', profileId] });
    },
  });
}

/**
 * Mutation to delete an address.
 */
export function useDeleteAddress(profileId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', profileId] });
    },
  });
}
