import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  user_id: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setAuth: (authData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    access: string;
    refresh: string;
  }) => void;
  logout: () => void;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      setAuth: (authData) => {
        try {
          const decoded = jwtDecode<{ user_id: number }>(authData.access);

          const user: User = {
            username: authData.username,
            email: authData.email,
            first_name: authData.first_name,
            last_name: authData.last_name,
            phone_number: authData.phone_number,
            role: authData.role,
            user_id: decoded.user_id,
          };

          // Set both cookies with explicit attributes
          document.cookie = `accessToken=${authData.access}; path=/; secure; samesite=lax; max-age=3600`;
          // Store auth data in a separate cookie with longer expiration
          const authStorage = JSON.stringify({
            state: {
              user,
              isAuthenticated: true,
              accessToken: authData.access,
              refreshToken: authData.refresh
            }
          });
          document.cookie = `auth-storage=${encodeURIComponent(authStorage)}; path=/; secure; samesite=lax; max-age=86400`;

          set({
            accessToken: authData.access,
            refreshToken: authData.refresh,
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Failed to set auth data:', error);
        }
      },

      logout: () => {
        // Clear all auth-related cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
      },

      getUser: () => {
        const state = get();
        if (!state.accessToken || !state.user) return null;

        try {
          const decoded = jwtDecode<{ exp: number }>(state.accessToken);
          if (decoded.exp * 1000 < Date.now()) {
            set({ user: null, isAuthenticated: false });
            return null;
          }
          return state.user;
        } catch {
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Explicitly define what gets persisted
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);