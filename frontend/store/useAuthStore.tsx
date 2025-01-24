// store/useAuthStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
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
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse extends User {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Login failed');
            }

            const data: AuthResponse = await response.json();

            // Extract user data from response
            const { access, refresh, ...userData } = data;

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });

            // Setup refresh timer
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
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Signup failed');
            }

            const responseData: AuthResponse = await response.json();
            const { access, refresh, ...userData } = responseData;

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });

            // Setup refresh timer
            setupRefreshTimer();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Signup failed',
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
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error('Logout failed');
            }

            // Clear refresh timer
            clearRefreshTimer();
            
            set({
              user: null,
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

            // Reset the refresh timer
            setupRefreshTimer();
            return true;
          } catch (error) {
            // If refresh fails, log out the user
            set({
              user: null,
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
        // Only persist these fields
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Refresh token timer
let refreshTimeout: NodeJS.Timeout;

// Setup refresh timer (refresh 5 minutes before expiration)
export const setupRefreshTimer = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  refreshTimeout = setTimeout(async () => {
    const { refreshToken } = useAuthStore.getState();
    const success = await refreshToken();
    if (success) {
      setupRefreshTimer();
    }
  }, (55 * 60 * 1000)); // 55 minutes
};

// Clear refresh timer
export const clearRefreshTimer = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
};

// Hook for complete auth state
export function useAuth() {
  const state = useAuthStore();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    signup: state.signup,
    logout: state.logout,
    refreshToken: state.refreshToken,
    clearError: state.clearError,
  };
}

// Hook for authentication status
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

// Hook for current user
export function useUser() {
  return useAuthStore((state) => state.user);
}

// Hook for loading state
export function useAuthLoading() {
  return useAuthStore((state) => state.isLoading);
}

// Hook for error state
export function useAuthError() {
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  return { error, clearError };
}