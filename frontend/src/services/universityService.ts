import { apiMethods, buildUrl } from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type { UniversityProfile, User, PaginatedResponse } from '../types';

export const universityService = {
  // University Profiles
  getUniversityProfiles: async (params?: {
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<UniversityProfile>> => {
    const url = buildUrl(API_ENDPOINTS.UNIVERSITIES.LIST, params);
    return apiMethods.get<PaginatedResponse<UniversityProfile>>(url);
  },

  getUniversityProfileById: async (id: number): Promise<UniversityProfile> => {
    return apiMethods.get<UniversityProfile>(API_ENDPOINTS.UNIVERSITIES.DETAIL(id));
  },

  createUniversityProfile: async (data: {
    display_name: string;
    base_user_id: number;
  }): Promise<UniversityProfile> => {
    return apiMethods.post<UniversityProfile>(API_ENDPOINTS.UNIVERSITIES.LIST, data);
  },

  updateUniversityProfile: async (id: number, data: Partial<{
    display_name: string;
  }>): Promise<UniversityProfile> => {
    return apiMethods.patch<UniversityProfile>(API_ENDPOINTS.UNIVERSITIES.DETAIL(id), data);
  },

  deleteUniversityProfile: async (id: number): Promise<void> => {
    return apiMethods.delete<void>(API_ENDPOINTS.UNIVERSITIES.DETAIL(id));
  },

  // My Universities (for staff users)
  getMyUniversities: async (): Promise<UniversityProfile> => {
    return apiMethods.get<UniversityProfile>(API_ENDPOINTS.UNIVERSITIES.MY_UNIVERSITIES);
  },

  // University Staff
  getUniversityStaff: async (universityId: number, params?: {
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<User>> => {
    const url = buildUrl(API_ENDPOINTS.UNIVERSITIES.STAFF(universityId), params);
    return apiMethods.get<PaginatedResponse<User>>(url);
  },

  addStaffToUniversity: async (universityId: number, data: {
    user_id: number;
    position?: string;
    department?: string;
  }): Promise<User> => {
    return apiMethods.post<User>(API_ENDPOINTS.UNIVERSITIES.STAFF(universityId), data);
  },

  removeStaffFromUniversity: async (universityId: number, userId: number): Promise<void> => {
    return apiMethods.delete<void>(`${API_ENDPOINTS.UNIVERSITIES.STAFF(universityId)}${userId}/`);
  },

  updateStaffRole: async (universityId: number, userId: number, data: {
    position?: string;
    department?: string;
    is_active?: boolean;
  }): Promise<User> => {
    return apiMethods.patch<User>(`${API_ENDPOINTS.UNIVERSITIES.STAFF(universityId)}${userId}/`, data);
  },

  // University Statistics
  getUniversityStatistics: async (universityId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    total_agendas: number;
    active_agendas: number;
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    total_staff: number;
    active_staff: number;
    average_rating: number | null;
    popular_themes: Array<{
      theme_name: string;
      appointment_count: number;
    }>;
    monthly_stats: Array<{
      month: string;
      appointments: number;
      completed: number;
      cancelled: number;
    }>;
  }> => {
    const url = buildUrl(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}statistics/`, params);
    return apiMethods.get(url);
  },

  // University Settings
  getUniversitySettings: async (universityId: number): Promise<{
    id: number;
    university: number;
    default_slot_duration: number;
    default_booking_deadline_hours: number;
    default_cancellation_deadline_hours: number;
    allow_online_meetings: boolean;
    allow_phone_meetings: boolean;
    require_approval: boolean;
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
    working_hours: {
      monday: { start: string; end: string; enabled: boolean };
      tuesday: { start: string; end: string; enabled: boolean };
      wednesday: { start: string; end: string; enabled: boolean };
      thursday: { start: string; end: string; enabled: boolean };
      friday: { start: string; end: string; enabled: boolean };
      saturday: { start: string; end: string; enabled: boolean };
      sunday: { start: string; end: string; enabled: boolean };
    };
    holidays: Array<{
      date: string;
      name: string;
      recurring: boolean;
    }>;
  }> => {
    return apiMethods.get(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}settings/`);
  },

  updateUniversitySettings: async (universityId: number, data: any): Promise<any> => {
    return apiMethods.patch(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}settings/`, data);
  },

  // University Branding
  getUniversityBranding: async (universityId: number): Promise<{
    id: number;
    university: number;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    custom_css?: string;
    email_template_header?: string;
    email_template_footer?: string;
  }> => {
    return apiMethods.get(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}branding/`);
  },

  updateUniversityBranding: async (universityId: number, data: any): Promise<any> => {
    return apiMethods.patch(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}branding/`, data);
  },

  uploadUniversityLogo: async (universityId: number, file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}upload-logo/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Logo upload failed');
    }
    
    return response.json();
  },

  // University Reports
  generateUniversityReport: async (universityId: number, params: {
    report_type: 'appointments' | 'staff_performance' | 'utilization' | 'feedback';
    start_date: string;
    end_date: string;
    format: 'pdf' | 'xlsx' | 'csv';
    include_charts?: boolean;
  }): Promise<Blob> => {
    const url = buildUrl(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}reports/`, params);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Report generation failed');
    }
    
    return response.blob();
  },

  // University Integration
  getIntegrationSettings: async (universityId: number): Promise<{
    calendar_integration: {
      enabled: boolean;
      provider: 'google' | 'outlook' | 'ical' | null;
      sync_url?: string;
    };
    sso_integration: {
      enabled: boolean;
      provider: 'saml' | 'oauth' | null;
      config?: any;
    };
    webhook_settings: {
      enabled: boolean;
      endpoints: Array<{
        url: string;
        events: string[];
        secret?: string;
      }>;
    };
  }> => {
    return apiMethods.get(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}integrations/`);
  },

  updateIntegrationSettings: async (universityId: number, data: any): Promise<any> => {
    return apiMethods.patch(`${API_ENDPOINTS.UNIVERSITIES.DETAIL(universityId)}integrations/`, data);
  },

  // Bulk Operations
  bulkUpdateStaff: async (universityId: number, data: {
    staff_ids: number[];
    updates: {
      is_active?: boolean;
      position?: string;
      department?: string;
    };
  }): Promise<{ updated_count: number; errors: any[] }> => {
    return apiMethods.post(`${API_ENDPOINTS.UNIVERSITIES.STAFF(universityId)}bulk-update/`, data);
  },

  bulkImportStaff: async (universityId: number, file: File): Promise<{
    imported_count: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_ENDPOINTS.UNIVERSITIES.STAFF(universityId)}bulk-import/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Staff import failed');
    }
    
    return response.json();
  },
};

