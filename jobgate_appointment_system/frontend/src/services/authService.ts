import api, { apiMethods } from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  UserPreferences 
} from '../types';


interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
}

export const authService = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    return apiMethods.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  register: async (data: RegisterData): Promise<User> => {
    return apiMethods.post<User>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    return apiMethods.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh: refreshToken,
    });
  },

  verifyToken: async (token: string): Promise<void> => {
    return apiMethods.post<void>(API_ENDPOINTS.AUTH.VERIFY, {
      token,
    });
  },

  logout: async (): Promise<void> => {
    return apiMethods.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // User profile
  getCurrentUser: async (): Promise<User> => {
    return apiMethods.get<User>(API_ENDPOINTS.AUTH.USER_PROFILE);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiMethods.patch<User>(API_ENDPOINTS.USERS.PROFILE, data);
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    re_new_password: string;
  }): Promise<void> => {
    return apiMethods.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  // Password reset
  resetPassword: async (email: string): Promise<void> => {
    return apiMethods.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  },

  resetPasswordConfirm: async (data: {
    uid: string;
    token: string;
    new_password: string;
    re_new_password: string;
  }): Promise<void> => {
    return apiMethods.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, data);
  },

  // User preferences
  getUserPreferences: async (): Promise<UserPreferences> => {
    return apiMethods.get<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES);
  },

  updateUserPreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    return apiMethods.patch<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES, data);
  },

  // User management (admin)
  getUsers: async (params?: {
    user_type?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: User[]; count: number; next?: string; previous?: string }> => {
    const queryParams = new URLSearchParams();
    if (params?.user_type) queryParams.append('user_type', params.user_type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.USERS.LIST;
    
    return apiMethods.get(url);
  },

  getUserById: async (id: number): Promise<User> => {
    return apiMethods.get<User>(`${API_ENDPOINTS.USERS.LIST}${id}/`);
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    return apiMethods.patch<User>(`${API_ENDPOINTS.USERS.LIST}${id}/`, data);
  },

  deleteUser: async (id: number): Promise<void> => {
    return apiMethods.delete<void>(`${API_ENDPOINTS.USERS.LIST}${id}/`);
  },

  /**
   * Request a password reset for the given email address
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      const response = await api.post('/auth/password/reset/', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  },

  /**
   * Confirm password reset with UID, token, and new password
   */
  confirmPasswordReset: async (data: PasswordResetConfirm): Promise<void> => {
    try {
      const response = await api.post('/auth/password/reset/confirm/', {
        uid: data.uid,
        token: data.token,
        new_password: data.new_password,
      });
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  },
  
};

