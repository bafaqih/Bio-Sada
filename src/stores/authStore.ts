import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Profile } from '@/lib/types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isFetchingProfile: boolean;
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

let authListener: { data: { subscription: any } } | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ── State ──────────────────────────────────────────────
  session: null,
  profile: null,
  isLoading: true,
  isFetchingProfile: false,
  isInitialized: false,

  // ── Actions ────────────────────────────────────────────

  fetchProfile: async (userId: string) => {
    try {
      set({ isFetchingProfile: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, is_verified, phone_number, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[authStore] Failed to fetch profile:', error.message);
        if (error.code === 'PGRST116') {
          set({ profile: null });
        }
        return;
      }

      set({ profile: data as Profile });
    } catch (err) {
      console.error('[authStore] Unexpected error fetching profile:', err);
    } finally {
      set({ isFetchingProfile: false });
    }
  },

  initializeAuth: async () => {
    const { fetchProfile } = get();

    // Prevent double initialization
    if (get().isInitialized && authListener) {
      return () => {};
    }

    try {
      set({ isLoading: true });
      
      // 1. Initial Session Check
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Explicit check for expiration
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt < now) {
          toast.error('Sesi Anda telah habis, harap masuk kembali.');
          await get().logout();
        } else {
          set({ session });
          await fetchProfile(session.user.id);
        }
      }
    } catch (err) {
      console.error('[authStore] Initialization error:', err);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    // 2. Set up singleton listener
    if (!authListener) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          // Sync session immediately
          set({ session: newSession });

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (newSession?.user) {
              // Call fetchProfile without 'await' to avoid blocking the auth state transition
              fetchProfile(newSession.user.id);
            }
          }

          if (event === 'SIGNED_OUT') {
            set({ profile: null, session: null });
          }
        },
      );
      authListener = { data: { subscription } };
    }

    return () => {
      // In a singleton pattern, we typically don't unsubscribe on component unmount
      // as the store lives for the app's lifetime.
    };
  },

  logout: async () => {
    try {
      // Set profile/session to null immediately to update UI instantly
      set({ session: null, profile: null });
      // Clear Supabase session
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[authStore] Logout error:', err);
    }
  },
}));
