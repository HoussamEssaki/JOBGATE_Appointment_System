import { apiMethods, buildUrl } from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type {
  AppointmentTheme,
  Agenda,
  AgendaCreateForm,
  CalendarSlot,
  CalendarSlotCreateForm,
  Appointment,
  AppointmentBookingForm,
  PaginatedResponse,
} from '../types';

export const appointmentService = {
  // Appointment Themes
  getAppointmentThemes: async (): Promise<AppointmentTheme[]> => {
    return apiMethods.get<AppointmentTheme[]>(API_ENDPOINTS.APPOINTMENTS.THEMES);
  },

  // Agendas
  getAgendas: async (params?: {
    university_profile_id?: number;
    theme_id?: number;
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Agenda>> => {
    const url = buildUrl(API_ENDPOINTS.APPOINTMENTS.AGENDAS, params);
    return apiMethods.get<PaginatedResponse<Agenda>>(url);
  },

  getAgendaById: async (id: number): Promise<Agenda> => {
    return apiMethods.get<Agenda>(API_ENDPOINTS.APPOINTMENTS.AGENDA_DETAIL(id));
  },

  createAgenda: async (data: AgendaCreateForm): Promise<Agenda> => {
    return apiMethods.post<Agenda>(API_ENDPOINTS.APPOINTMENTS.AGENDAS, data);
  },

  updateAgenda: async (id: number, data: Partial<AgendaCreateForm>): Promise<Agenda> => {
    return apiMethods.patch<Agenda>(API_ENDPOINTS.APPOINTMENTS.AGENDA_DETAIL(id), data);
  },

  deleteAgenda: async (id: number): Promise<void> => {
    return apiMethods.delete<void>(API_ENDPOINTS.APPOINTMENTS.AGENDA_DETAIL(id));
  },

  // Calendar Slots
  getCalendarSlots: async (params?: {
    agenda_id?: number;
    start_date?: string;
    end_date?: string;
    staff_id?: number;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<CalendarSlot>> => {
    const url = buildUrl(API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOTS, params);
    return apiMethods.get<PaginatedResponse<CalendarSlot>>(url);
  },

  getCalendarSlotById: async (id: number): Promise<CalendarSlot> => {
    return apiMethods.get<CalendarSlot>(API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOT_DETAIL(id));
  },

  createCalendarSlot: async (data: CalendarSlotCreateForm): Promise<CalendarSlot> => {
    return apiMethods.post<CalendarSlot>(API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOTS, data);
  },

  updateCalendarSlot: async (id: number, data: Partial<CalendarSlotCreateForm>): Promise<CalendarSlot> => {
    return apiMethods.patch<CalendarSlot>(API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOT_DETAIL(id), data);
  },

  deleteCalendarSlot: async (id: number): Promise<void> => {
    return apiMethods.delete<void>(API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOT_DETAIL(id));
  },

  // Available Slots
  getAvailableSlots: async (params: {
    agenda_id: number;
    start_date?: string;
    end_date?: string;
  }): Promise<CalendarSlot[]> => {
    const url = buildUrl(API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS, params);
    return apiMethods.get<CalendarSlot[]>(url);
  },

  // Appointments
  getAppointments: async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const url = buildUrl(API_ENDPOINTS.APPOINTMENTS.APPOINTMENTS, params);
    return apiMethods.get<PaginatedResponse<Appointment>>(url);
  },

  getAppointmentById: async (id: number): Promise<Appointment> => {
    return apiMethods.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.APPOINTMENT_DETAIL(id));
  },

  bookAppointment: async (data: AppointmentBookingForm): Promise<Appointment> => {
    return apiMethods.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BOOK_APPOINTMENT, data);
  },

  updateAppointment: async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
    return apiMethods.patch<Appointment>(API_ENDPOINTS.APPOINTMENTS.APPOINTMENT_DETAIL(id), data);
  },

  cancelAppointment: async (id: number): Promise<Appointment> => {
    return apiMethods.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.CANCEL_APPOINTMENT(id));
  },

  // Statistics
  getAppointmentStatistics: async (params?: {
    university_profile_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    total_appointments: number;
    confirmed_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    no_show_appointments: number;
    unique_talents: number;
    average_rating: number | null;
    total_duration_minutes: number;
    by_theme: Array<{
      calendar_slot__agenda__theme__name: string;
      count: number;
      completed: number;
      cancelled: number;
    }>;
  }> => {
    const url = buildUrl(API_ENDPOINTS.APPOINTMENTS.STATISTICS, params);
    return apiMethods.get(url);
  },

  // Bulk operations
  createMultipleSlots: async (data: {
    agenda_id: number;
    staff_id: number;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    max_capacity: number;
    days_of_week: number[]; // 0 = Sunday, 1 = Monday, etc.
    location?: string;
    meeting_type: 'in_person' | 'online' | 'phone';
    meeting_link?: string;
    notes?: string;
  }): Promise<CalendarSlot[]> => {
    return apiMethods.post<CalendarSlot[]>(`${API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOTS}bulk/`, data);
  },

  // Appointment feedback
  submitAppointmentFeedback: async (id: number, data: {
    rating: number;
    feedback?: string;
  }): Promise<Appointment> => {
    return apiMethods.patch<Appointment>(
      `${API_ENDPOINTS.APPOINTMENTS.APPOINTMENT_DETAIL(id)}feedback/`,
      data
    );
  },

  // Export appointments
  exportAppointments: async (params?: {
    format: 'csv' | 'xlsx';
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<Blob> => {
    const url = buildUrl(`${API_ENDPOINTS.APPOINTMENTS.APPOINTMENTS}export/`, params);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },

  // Calendar integration
  getCalendarEvents: async (params: {
    start_date: string;
    end_date: string;
    user_id?: number;
  }): Promise<Array<{
    id: number;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    status: string;
    type: 'appointment' | 'slot';
  }>> => {
    const url = buildUrl(`${API_ENDPOINTS.APPOINTMENTS.APPOINTMENTS}calendar/`, params);
    return apiMethods.get(url);
  },

  // Reminder management
  sendReminder: async (appointmentId: number, reminderType: 'confirmation' | '24_hour' | '1_hour'): Promise<void> => {
    return apiMethods.post<void>(
      `${API_ENDPOINTS.APPOINTMENTS.APPOINTMENT_DETAIL(appointmentId)}send-reminder/`,
      { reminder_type: reminderType }
    );
  },

  // Appointment conflicts
  checkSlotConflicts: async (data: {
    staff_id: number;
    slot_date: string;
    start_time: string;
    end_time: string;
    exclude_slot_id?: number;
  }): Promise<{
    has_conflicts: boolean;
    conflicts: CalendarSlot[];
  }> => {
    return apiMethods.post(`${API_ENDPOINTS.APPOINTMENTS.CALENDAR_SLOTS}check-conflicts/`, data);
  },
};

