// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/jwt/create/',
    REFRESH: '/auth/jwt/refresh/',
    VERIFY: '/auth/jwt/verify/',
    REGISTER: '/auth/users/',
    LOGOUT: '/auth/logout/',
    USER_PROFILE: '/auth/users/me/',
    CHANGE_PASSWORD: '/auth/users/set_password/',
    RESET_PASSWORD: '/auth/users/reset_password/',
    RESET_PASSWORD_CONFIRM: '/auth/users/reset_password_confirm/',
  },
  
  // Users
  USERS: {
    LIST: '/api/users/',
    PROFILE: '/api/users/profile/',
    PREFERENCES: '/api/users/preferences/',
  },
  
  // Universities
  UNIVERSITIES: {
    LIST: '/api/universities/',
    DETAIL: (id: number) => `/api/universities/${id}/`,
    MY_UNIVERSITIES: '/api/universities/my-universities/',
    STAFF: (id: number) => `/api/universities/${id}/staff/`,
  },
  
  // Appointments
  APPOINTMENTS: {
    THEMES: '/api/appointments/themes/',
    AGENDAS: '/api/appointments/agendas/',
    AGENDA_DETAIL: (id: number) => `/api/appointments/agendas/${id}/`,
    CALENDAR_SLOTS: '/api/appointments/calendar-slots/',
    CALENDAR_SLOT_DETAIL: (id: number) => `/api/appointments/calendar-slots/${id}/`,
    AVAILABLE_SLOTS: '/api/appointments/available-slots/',
    APPOINTMENTS: '/api/appointments/',
    APPOINTMENT_DETAIL: (id: number) => `/api/appointments/${id}/`,
    BOOK_APPOINTMENT: '/api/appointments/book/',
    CANCEL_APPOINTMENT: (id: number) => `/api/appointments/${id}/cancel/`,
    STATISTICS: '/api/appointments/statistics/',
  },
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PREFERENCES: '/profile/preferences',
  
  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_DETAIL: (id: number) => `/appointments/${id}`,
  BOOK_APPOINTMENT: '/appointments/book',
  CALENDAR: '/calendar',
  
  // Universities (Staff only)
  UNIVERSITIES: '/universities',
  UNIVERSITY_DETAIL: (id: number) => `/universities/${id}`,
  MANAGE_AGENDAS: '/universities/agendas',
  AGENDA_DETAIL: (id: number) => `/universities/agendas/${id}`,
  CREATE_AGENDA: '/universities/agendas/create',
  MANAGE_SLOTS: '/universities/slots',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_UNIVERSITIES: '/admin/universities',
  ADMIN_STATISTICS: '/admin/statistics',
} as const;

// User Types
export const USER_TYPES = {
  ADMIN: 'admin',
  UNIVERSITY_STAFF: 'university_staff',
  TALENT: 'talent',
  RECRUITER: 'recruiter',
} as const;

// Meeting Types
export const MEETING_TYPES = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  PHONE: 'phone',
  ANY: 'any',
} as const;

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

// Calendar Slot Status
export const SLOT_STATUS = {
  AVAILABLE: 'available',
  FULLY_BOOKED: 'fully_booked',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
} as const;

// Staff Roles
export const STAFF_ROLES = {
  ADVISOR: 'advisor',
  COORDINATOR: 'coordinator',
  ASSISTANT: 'assistant',
} as const;

// Eligibility Criteria Types
export const CRITERIA_TYPES = {
  UNIVERSITY: 'university',
  YEAR_OF_STUDY: 'year_of_study',
  FIELD_OF_STUDY: 'field_of_study',
  GPA_MINIMUM: 'gpa_minimum',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
} as const;

// Theme Configuration
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  ERROR: '#d32f2f',
  WARNING: '#ed6c02',
  INFO: '#0288d1',
} as const;

// Date and Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 150,
  NAME_MAX_LENGTH: 150,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully!',
  AGENDA_CREATED: 'Agenda created successfully!',
  SLOT_CREATED: 'Calendar slot created successfully!',
} as const;

// Default Values
export const DEFAULTS = {
  SLOT_DURATION: 30,
  MAX_CAPACITY: 1,
  BOOKING_DEADLINE_HOURS: 24,
  CANCELLATION_DEADLINE_HOURS: 24,
  TIMEZONE: 'UTC',
  LANGUAGE: 'en',
  MEETING_TYPE: MEETING_TYPES.IN_PERSON,
} as const;

