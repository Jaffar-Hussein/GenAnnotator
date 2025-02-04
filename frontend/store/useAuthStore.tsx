import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
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
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_superuser: boolean;
    is_staff: boolean;
  };
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
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

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
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
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Login failed');
            }

            const data: AuthResponse = await response.json();
            console.log('🚀 Login data:', data);
            set({
              user: {
                username: data.user.username,
                email: data.user.email,
                first_name: data.user.first_name,
                last_name: data.user.last_name,
                role: data.user.role,
                is_superuser: data.user.is_superuser,
                is_staff: data.user.is_staff,
              },
              accessToken: data.access,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('🚀 Login state:', useAuthStore.getState());
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
          console.log('🚀 Signup data:', data);
        
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

            console.log('🚀 Signup response:', responseData);
        
            set({
              user: {
                username: responseData.user.username,
                email: responseData.user.email,
                first_name: responseData.user.first_name,
                last_name: responseData.user.last_name,
                role: responseData.user.role,
                is_superuser: responseData.user.is_superuser,
                is_staff: responseData.user.is_staff,
              },
              accessToken: responseData.access,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('🚀 Signup state:', useAuthStore.getState());
        
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
            console.log('Starting token refresh in store');
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include', // Important for cookies
            });
        
            if (!response.ok) {
              console.error('Refresh request failed:', response.status);
              throw new Error('Token refresh failed');
            }
        
            const data = await response.json();
            console.log('Refresh response data:', data);
        
            // Only update access token
            set((state) => ({
              ...state,
              accessToken: data.access,
              isAuthenticated: true
            }));
        
            console.log('Store state updated with new access token');
            return true;
          } catch (error) {
            console.error('Token refresh failed:', error);
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
    console.log('Attempting token refresh');
    const success = await useAuthStore.getState().refreshToken();
    if (success) {
      setupRefreshTimer(); // Set up next refresh only if successful
    }
  }, REFRESH_INTERVAL);
};

export const clearRefreshTimer = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
};

export function useAuth(p0: (state: any) => any) {
  const state = useAuthStore();
  return {
    user: state.user,
    accessToken: state.accessToken,
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

export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

export function useUser() {
  return useAuthStore((state) => state.user);
}



export function useAuthLoading() {
  return useAuthStore((state) => state.isLoading);
}

export function useAuthError() {
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  return { error, clearError };
}