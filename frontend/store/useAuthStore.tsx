import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);