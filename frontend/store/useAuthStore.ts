import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types/userTypes';
import { fetchApi } from '@/lib/doFetch';
import { useCourseStore } from './useCourseStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      setHasHydrated: (val) => set({ hasHydrated: val }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetchApi.post<
            { email: string; password: string },
            { user: User, accessToken: string }
          >('api/users/login', { email, password });



          set({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
          });


          document.cookie = `accessToken=${res.accessToken}; path=/; max-age=86400;`;





        } catch (err) {
          const error = err instanceof Error ? err.message : 'Login failed';
          set({ error, isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await fetchApi.post('api/users/register', { name, email, password });
          set({ isLoading: false });
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Registration failed';
          set({ error, isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetchApi.post('api/users/logout', {}, true, { requiresAuth: true });
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          // Clear accessToken cookie
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          useCourseStore.getState().clearStore();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },


      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const res = await fetchApi.get<{ user: User }>('api/users/profile');
          set({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const error = err instanceof Error ? err.message : '';
          if (error.includes('Session expired')) {
            await get().logout();
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (typeof window !== 'undefined') {
          state?.fetchUser();
        }
      },
    }
  )
);
