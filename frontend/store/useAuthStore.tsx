import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';


interface SignupResponse {
  message: string;
  status: string;
}
interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  user_id: number;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
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
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => void;
  getUser: () => User | null;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      signup: async (signupData: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:8000/access/api/new/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData),
          });
      
          const data: SignupResponse = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
          }
      
          // Just clear any errors and return - no token handling
          set({
            isLoading: false,
            error: null
          });
      
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred during signup',
            isLoading: false 
          });
          throw error;
        }
      },

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

          document.cookie = `accessToken=${authData.access}; path=/; secure; samesite=lax; max-age=3600`;
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
            error: null,
          });
        } catch (error) {
          console.error('Failed to set auth data:', error);
          set({ error: 'Failed to set authentication data' });
        }
      },

      logout: () => {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          error: null,
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

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);



// signup: async (signupData: SignupData) => {
//   set({ isLoading: true, error: null });
//   try {
//     const response = await fetch('/api/auth/signup', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(signupData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Signup failed');
//     }

//     const data = await response.json();
    
//     // If your API returns tokens immediately after signup
//     if (data.access && data.refresh) {
//       const decoded = jwtDecode<{ user_id: number }>(data.access);
//       const user: User = {
//         username: signupData.username,
//         email: signupData.email,
//         first_name: signupData.first_name,
//         last_name: signupData.last_name,
//         phone_number: signupData.phone_number,
//         role: 'user', // Default role for new signups
//         user_id: decoded.user_id,
//       };

//       // Set cookies
//       document.cookie = `accessToken=${data.access}; path=/; secure; samesite=lax; max-age=3600`;
//       const authStorage = JSON.stringify({
//         state: {
//           user,
//           isAuthenticated: true,
//           accessToken: data.access,
//           refreshToken: data.refresh
//         }
//       });
//       document.cookie = `auth-storage=${encodeURIComponent(authStorage)}; path=/; secure; samesite=lax; max-age=86400`;

//       set({
//         user,
//         isAuthenticated: true,
//         accessToken: data.access,
//         refreshToken: data.refresh,
//         isLoading: false,
//       });
//     }
//   } catch (error) {
//     set({ 
//       error: error instanceof Error ? error.message : 'An error occurred during signup',
//       isLoading: false 
//     });
//     throw error;
//   }
// },