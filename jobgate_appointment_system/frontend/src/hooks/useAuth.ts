import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { LoginCredentials, RegisterData } from '../types';
import { SUCCESS_MESSAGES } from '../constants';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  } = useAuthStore();

  const { showNotification } = useUIStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      showNotification(SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      showNotification(errorMessage, 'error');
      return false;
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data);
      showNotification(SUCCESS_MESSAGES.REGISTRATION_SUCCESS, 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      showNotification(errorMessage, 'error');
      return false;
    }
  };

  const handleLogout = () => {
    logout();
    showNotification(SUCCESS_MESSAGES.LOGOUT_SUCCESS, 'success');
  };

  const isAdmin = user?.user_type === 'admin';
  const isUniversityStaff = user?.user_type === 'university_staff';
  const isTalent = user?.user_type === 'talent';
  const isRecruiter = user?.user_type === 'recruiter';

  const hasRole = (roles: string | string[]) => {
    const required = Array.isArray(roles) ? roles : [roles];
    const userRole = user?.user_type?.toLowerCase();
    return userRole ? required.some((r) => r.toLowerCase() === userRole) : false;
  };

  const canAccessRoute = (requiredRoles?: string | string[]) => {
    if (!requiredRoles) return true;
    if (!isAuthenticated) return false;
    return hasRole(requiredRoles);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isUniversityStaff,
    isTalent,
    isRecruiter,
    hasRole,
    canAccessRoute,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};