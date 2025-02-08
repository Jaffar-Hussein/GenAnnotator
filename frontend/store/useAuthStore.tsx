import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const REFRESH_INTERVAL = 50 * 60 * 1000;

export interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_superuser: boolean;
  is_staff: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        updateUserProfile: (userData: Partial<User>) => {
          set((state) => ({
            ...state,
            user: state.user ? { ...state.user, ...userData } : null
          }));
        },

        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Login failed');
            }

            const data: AuthResponse = await response.json();
            set({
              user: data.user,
              accessToken: data.access,
              isAuthenticated: true,
              isLoading: false,
            });
            setupRefreshTimer();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
            });
            throw error;
          }
        },

        signup: async (data: SignupData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
        
            const responseData = await response.json();
        
            if (!response.ok) {
              if (typeof responseData.error === 'string') {
                throw new Error(responseData.error);
              }
              throw { 
                fieldErrors: responseData,
                message: 'Validation failed'
              };
            }
        
            set({
              user: responseData.user,
              accessToken: responseData.access,
              isAuthenticated: true,
              isLoading: false,
            });
        
            setupRefreshTimer();
          } catch (error: any) {
            set({
              error: error.fieldErrors ? 'Validation failed' : error.message || 'Signup failed',
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            const response = await fetch('/api/auth/logout', {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Logout failed');
            }

            clearRefreshTimer();
            
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Logout failed',
              isLoading: false,
            });
            throw error;
          }
        },

        refreshToken: async () => {
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });
        
            if (!response.ok) {
              throw new Error('Token refresh failed');
            }
        
            const data = await response.json();
            set((state) => ({
              ...state,
              accessToken: data.access,
              isAuthenticated: true
            }));
        
            return true;
          } catch (error) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              error: 'Session expired',
            });
            clearRefreshTimer();
            return false;
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

let refreshTimeout: NodeJS.Timeout;

export const setupRefreshTimer = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  refreshTimeout = setTimeout(async () => {
    const success = await useAuthStore.getState().refreshToken();
    if (success) {
      setupRefreshTimer();
    }
  }, REFRESH_INTERVAL);
};

export const clearRefreshTimer = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
};

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => {
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  return { error, clearError };
};