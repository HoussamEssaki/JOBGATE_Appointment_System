// User Types
export interface User {
  pk: number;
  birth: string;
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'university_staff' | 'talent' | 'recruiter';
  phone_number?: string;
  is_active: boolean;
  last_login?: string;
  date_joined: string;
  bio?: string;
  date_of_birth?: string;
  location?: string;
  university?: { name: string };
}

export interface UserPreferences {
  cancellation_notice_hours: string | number | undefined;
  id: number;
  user: number;
  email_reminders_enabled: boolean;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  preferred_meeting_type: 'in_person' | 'online' | 'phone' | 'any';
  user_timezone: string;
  language: string;
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  preferences?: UserPreferences;
}

// University Types
export interface UniversityProfile {
  id: number;
  display_name: string;
  base_user: User;
  created_by: number;
  updated_by?: number;
  current_task_id?: string;
  created_at: string;
  updated_at: string;
}

// Appointment Types
export interface AppointmentTheme {
  id: number;
  name: string;
  description?: string;
  color_code?: string;
  icon?: string;
  is_active: boolean;
}

export interface TalentEligibilityCriteria {
  id: number;
  criteria_type: 'university' | 'year_of_study' | 'field_of_study' | 'gpa_minimum';
  criteria_value: string;
  is_required: boolean;
}

export interface AgendaStaffAssignment {
  id: number;
  staff: User;
  role: 'advisor' | 'coordinator' | 'assistant';
  is_primary: boolean;
}

export interface Agenda {
  id: number;
  university: UniversityProfile;
  created_by: User;
  name: string;
  description?: string;
  theme: AppointmentTheme;
  slot_duration_minutes: number;
  max_capacity_per_slot: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern: Record<string, any>;
  booking_deadline_hours: number;
  cancellation_deadline_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  eligibility_criteria: TalentEligibilityCriteria[];
  staff_assignments: AgendaStaffAssignment[];
}

export interface CalendarSlot {
  id: number;
  agenda: Agenda;
  staff: User;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  available_capacity: number;
  status: 'available' | 'fully_booked' | 'cancelled' | 'blocked';
  notes?: string;
  location?: string;
  meeting_type: 'in_person' | 'online' | 'phone';
  meeting_link?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  calendar_slot: CalendarSlot;
  talent: User;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  talent_notes?: string;
  staff_notes?: string;
  rating?: number;
  feedback?: string;
  reminder_sent_24h: boolean;
  reminder_sent_1h: boolean;
  confirmation_sent: boolean;
  booked_at: string;
  cancelled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStatistics {
  id: number;
  university: UniversityProfile;
  theme: AppointmentTheme;
  staff?: User;
  date: string;
  total_slots: number;
  booked_slots: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  total_duration_minutes: number;
  unique_talents_count: number;
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'talent' | 'university_staff';
  phone_number?: string;
  password1: string;       
  password2: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Form Types
export interface AppointmentBookingForm {
  calendar_slot_id: number;
  talent_notes?: string;
}

export interface AgendaCreateForm {
  name: string;
  description?: string;
  theme_id: number;
  slot_duration_minutes: number;
  max_capacity_per_slot: number;
  start_date: string;
  end_date: string;
  booking_deadline_hours: number;
  cancellation_deadline_hours: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  eligibility_criteria?: string;
}

export interface CalendarSlotCreateForm {
  agenda_id: number;
  staff_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  notes?: string;
  location?: string;
  meeting_type: 'in_person' | 'online' | 'phone';
  meeting_link?: string;
  is_active?: boolean;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Query Keys
export const QUERY_KEYS = {
  USER_PROFILE: 'userProfile',
  USER_PREFERENCES: 'userPreferences',
  APPOINTMENT_THEMES: 'appointmentThemes',
  AGENDAS: 'agendas',
  CALENDAR_SLOTS: 'calendarSlots',
  APPOINTMENTS: 'appointments',
  AVAILABLE_SLOTS: 'availableSlots',
  UNIVERSITY_PROFILES: 'universityProfiles',
  APPOINTMENT_STATISTICS: 'appointmentStatistics',
} as const;

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  detail: string;
}

export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];

