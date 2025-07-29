import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { tokenManager } from '../utils/api';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services/authService';
import { getPasswordResetErrorMessage } from '../utils/errorHandling';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  passwordResetLoading: boolean;
  passwordResetSuccess: boolean;
  passwordResetError: string | null;

  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (
    uid: string,
    token: string,
    newPassword: string
  ) => Promise<void>;
  clearPasswordResetState: () => void;
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
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user, error: null });
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        }
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      login: async (credentials: LoginCredentials) => {
        const { setUser, setLoading, setError } = get();
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
            }/api/auth/jwt/create/`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
          }
          const tokens: AuthTokens = await response.json();
          tokenManager.setTokens(tokens.access, tokens.refresh);

          const profileResponse = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
            }/api/auth/users/me/`,
            { headers: { Authorization: `Bearer ${tokens.access}` } }
          );
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }
          const user: User = await profileResponse.json();
          setUser(user);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Login failed';
          setError(msg);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      register: async (data: RegisterData) => {
        const { setLoading, setError } = get();
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
            }/api/auth/registration/`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.email) throw new Error(errorData.email[0]);
            throw new Error('Registration failed');
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Registration failed';
          setError(msg);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      logout: () => {
        const { setUser } = get();
        tokenManager.clearTokens();
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.THEME_PREFERENCE);
        localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
      },

      refreshToken: async () => {
        const { setUser } = get();
        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken || tokenManager.isTokenExpired(refreshToken)) {
            return false;
          }
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
            }/api/auth/jwt/refresh/`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );
          if (!response.ok) return false;
          const { access } = await response.json();
          tokenManager.setTokens(access, refreshToken);

          const profileResponse = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
            }/api/auth/users/me/`,
            { headers: { Authorization: `Bearer ${access}` } }
          );
          if (!profileResponse.ok) {
            setUser(null);
            return false;
          }
          const user: User = await profileResponse.json();
          setUser(user);
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

        if (
          accessToken &&
          !tokenManager.isTokenExpired(accessToken) &&
          storedUser
        ) {
          try {
            const user: User = JSON.parse(storedUser);
            setUser(user);
          } catch {
            tokenManager.clearTokens();
            setUser(null);
          }
        } else if (tokenManager.getRefreshToken()) {
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

      passwordResetLoading: false,
      passwordResetSuccess: false,
      passwordResetError: null,

      requestPasswordReset: async (email: string) => {
        set({ passwordResetLoading: true, passwordResetError: null, passwordResetSuccess: false });
        try {
          await authService.requestPasswordReset(email);
          set({ passwordResetLoading: false, passwordResetSuccess: true });
        } catch (error: any) {
          set({
            passwordResetLoading: false,
            passwordResetError: getPasswordResetErrorMessage(error),
            passwordResetSuccess: false,
          });
          throw error;
        }
      },

      confirmPasswordReset: async (uid: string, token: string, newPassword: string) => {
        set({ passwordResetLoading: true, passwordResetError: null, passwordResetSuccess: false });
        try {
          await authService.confirmPasswordReset({ uid, token, new_password: newPassword });
          set({ passwordResetLoading: false, passwordResetSuccess: true });
        } catch (error: any) {
          set({
            passwordResetLoading: false,
            passwordResetError: getPasswordResetErrorMessage(error),
            passwordResetSuccess: false,
          });
          throw error;
        }
      },

      clearPasswordResetState: () =>
        set({ passwordResetLoading: false, passwordResetSuccess: false, passwordResetError: null }),
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