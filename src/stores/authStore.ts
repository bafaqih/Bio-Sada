import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  /** Fetch user profile from the `profiles` table by user ID. */
  fetchProfile: (userId: string) => Promise<void>;
  /**
   * Initialize auth: check the current session, fetch the profile,
   * and subscribe to auth state changes.
   * Returns an unsubscribe function for cleanup.
   */
  initializeAuth: () => Promise<() => void>;
  /** Sign out and reset all auth state. */
  logout: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ── State ──────────────────────────────────────────────
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  // ── Actions ────────────────────────────────────────────

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_verified, phone_number, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[authStore] Failed to fetch profile:', error.message);
      set({ profile: null });
      return;
    }

    set({ profile: data as Profile });
  },

  initializeAuth: async () => {
    const { fetchProfile } = get();

    // 1. Check existing session on app load (handles page refresh)
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({ session });
      await fetchProfile(session.user.id);
    }

    set({ isLoading: false, isInitialized: true });

    // 2. Listen for future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        set({ session: newSession });

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchProfile(newSession.user.id);
        }

        if (event === 'SIGNED_OUT') {
          set({ profile: null, session: null });
        }

        // TOKEN_REFRESHED is already handled by setting the new session above
      },
    );

    // Return unsubscribe function for cleanup in useEffect
    return () => subscription.unsubscribe();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
