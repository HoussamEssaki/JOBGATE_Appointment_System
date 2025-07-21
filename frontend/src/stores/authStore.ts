import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { tokenManager } from '../utils/api';
import { STORAGE_KEYS } from '../constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
        
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: async (credentials) => {
        const { setUser, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/auth/jwt/create/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          }
        );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
          }

          const tokens: AuthTokens = await response.json();
          tokenManager.setTokens(tokens.access, tokens.refresh);

          // Fetch user profile
          const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/auth/users/me/`, {
            headers: {
              'Authorization': `Bearer ${tokens.access}`,
            },
          });

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const user: User = await profileResponse.json();
          setUser(user);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          setError(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      register: async (data) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/auth/registration/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            try {
              // Try to parse the response as JSON to get the error details
              const errorData = await response.json();
              console.error('Registration failed:', errorData);

              // Check if there are any email-related errors and throw them if necessary
              if (errorData.email) {
                throw new Error(errorData.email[0]);
              }
            } catch (error) {
              // If it's not valid JSON, just log the text response
              const text = await response.text();
              console.error('Registration failed:', text);
              throw new Error('Failed to parse error response');
            }
          } else {
            // Handle the successful response
            console.log('Registration successful');
            // You might want to handle things like token storage, user info, etc. here
          }

          // Registration successful, but user needs to login
          // Some implementations might auto-login after registration
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          setError(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      logout: () => {
        const { setUser } = get();
        
        tokenManager.clearTokens();
        setUser(null);
        
        // Clear any other stored data
        localStorage.removeItem(STORAGE_KEYS.THEME_PREFERENCE);
        localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
      },

      refreshToken: async () => {
        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken || tokenManager.isTokenExpired(refreshToken)) {
            return false;
          }

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/auth/jwt/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!response.ok) {
            return false;
          }

          const { access } = await response.json();
          tokenManager.setTokens(access, refreshToken);
          
          return true;
        } catch {
          return false;
        }
      },

      clearError: () => set({ error: null }),

      checkAuthStatus: () => {
        const { setUser, refreshToken } = get();
        
        const accessToken = tokenManager.getAccessToken();
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        
        if (accessToken && !tokenManager.isTokenExpired(accessToken) && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUser(user);
          } catch {
            // Invalid stored user data
            tokenManager.clearTokens();
          }
        } else if (tokenManager.getRefreshToken()) {
          // Try to refresh the token
          refreshToken().then((success) => {
            if (!success) {
              tokenManager.clearTokens();
              setUser(null);
            }
          });
        } else {
          setUser(null);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

