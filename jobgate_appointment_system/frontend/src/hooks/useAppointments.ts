import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import { useUIStore } from '../stores/uiStore';
import { QUERY_KEYS } from '../types';
import { SUCCESS_MESSAGES } from '../constants';
import type {
  AgendaCreateForm,
  CalendarSlotCreateForm,
  Appointment,
  AppointmentBookingForm,
} from '../types';

export const useAppointments = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  // Appointment Themes
  const useAppointmentThemes = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.APPOINTMENT_THEMES],
      queryFn: appointmentService.getAppointmentThemes,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Agendas
  const useAgendas = (params?: {
    university_profile_id?: number;
    theme_id?: number;
    page?: number;
    search?: string;
  }) => {
    return useQuery({
      queryKey: [QUERY_KEYS.AGENDAS, params],
      queryFn: () => appointmentService.getAgendas(params),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useAgenda = (id: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.AGENDAS, id],
      queryFn: () => appointmentService.getAgendaById(id),
      enabled: !!id,
    });
  };

  const useCreateAgenda = () => {
    return useMutation({
      mutationFn: (data: AgendaCreateForm) => appointmentService.createAgenda(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENDAS] });
        showNotification(SUCCESS_MESSAGES.AGENDA_CREATED, 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to create agenda';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useUpdateAgenda = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<AgendaCreateForm> }) =>
        appointmentService.updateAgenda(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENDAS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENDAS, id] });
        showNotification('Agenda updated successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to update agenda';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useDeleteAgenda = () => {
    return useMutation({
      mutationFn: (id: number) => appointmentService.deleteAgenda(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AGENDAS] });
        showNotification('Agenda deleted successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to delete agenda';
        showNotification(errorMessage, 'error');
      },
    });
  };

  // Calendar Slots
  const useCalendarSlots = (params?: {
    agenda_id?: number;
    start_date?: string;
    end_date?: string;
    staff_id?: number;
    status?: string;
    page?: number;
  }) => {
    return useQuery({
      queryKey: [QUERY_KEYS.CALENDAR_SLOTS, params],
      queryFn: () => appointmentService.getCalendarSlots(params),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const useCalendarSlot = (id: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.CALENDAR_SLOTS, id],
      queryFn: () => appointmentService.getCalendarSlotById(id),
      enabled: !!id,
    });
  };

  const useAvailableSlots = (params: {
    agenda_id: number;
    start_date?: string;
    end_date?: string;
  }) => {
    return useQuery({
      queryKey: [QUERY_KEYS.AVAILABLE_SLOTS, params],
      queryFn: () => appointmentService.getAvailableSlots(params),
      enabled: !!params.agenda_id,
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  const useCreateCalendarSlot = () => {
    return useMutation({
      mutationFn: (data: CalendarSlotCreateForm) => appointmentService.createCalendarSlot(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification(SUCCESS_MESSAGES.SLOT_CREATED, 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to create calendar slot';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useUpdateCalendarSlot = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<CalendarSlotCreateForm> }) =>
        appointmentService.updateCalendarSlot(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS, id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification('Calendar slot updated successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to update calendar slot';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useDeleteCalendarSlot = () => {
    return useMutation({
      mutationFn: (id: number) => appointmentService.deleteCalendarSlot(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification('Calendar slot deleted successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to delete calendar slot';
        showNotification(errorMessage, 'error');
      },
    });
  };

  // Appointments
  const useAppointmentsList = (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }) => {
    return useQuery({
      queryKey: [QUERY_KEYS.APPOINTMENTS, params],
      queryFn: () => appointmentService.getAppointments(params),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const useAppointment = (id: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.APPOINTMENTS, id],
      queryFn: () => appointmentService.getAppointmentById(id),
      enabled: !!id,
    });
  };

  const useBookAppointment = () => {
    return useMutation({
      mutationFn: (data: AppointmentBookingForm) => appointmentService.bookAppointment(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification(SUCCESS_MESSAGES.APPOINTMENT_BOOKED, 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to book appointment';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useUpdateAppointment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Appointment> }) =>
        appointmentService.updateAppointment(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS, id] });
        showNotification('Appointment updated successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to update appointment';
        showNotification(errorMessage, 'error');
      },
    });
  };

  const useCancelAppointment = () => {
    return useMutation({
      mutationFn: (id: number) => appointmentService.cancelAppointment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification(SUCCESS_MESSAGES.APPOINTMENT_CANCELLED, 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to cancel appointment';
        showNotification(errorMessage, 'error');
      },
    });
  };

  // Statistics
  const useAppointmentStatistics = (params?: {
    university_profile_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    return useQuery({
      queryKey: [QUERY_KEYS.APPOINTMENT_STATISTICS, params],
      queryFn: () => appointmentService.getAppointmentStatistics(params),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Feedback
  const useSubmitFeedback = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: { rating: number; feedback?: string } }) =>
        appointmentService.submitAppointmentFeedback(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS, id] });
        showNotification('Feedback submitted successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to submit feedback';
        showNotification(errorMessage, 'error');
      },
    });
  };

  // Bulk operations
  const useCreateMultipleSlots = () => {
    return useMutation({
      mutationFn: (data: any) => appointmentService.createMultipleSlots(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CALENDAR_SLOTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });
        showNotification('Multiple slots created successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to create multiple slots';
        showNotification(errorMessage, 'error');
      },
    });
  };

  return {
    // Queries
    useAppointmentThemes,
    useAgendas,
    useAgenda,
    useCalendarSlots,
    useCalendarSlot,
    useAvailableSlots,
    useAppointmentsList,
    useAppointment,
    useAppointmentStatistics,

    // Mutations
    useCreateAgenda,
    useUpdateAgenda,
    useDeleteAgenda,
    useCreateCalendarSlot,
    useUpdateCalendarSlot,
    useDeleteCalendarSlot,
    useBookAppointment,
    useUpdateAppointment,
    useCancelAppointment,
    useSubmitFeedback,
    useCreateMultipleSlots,
  };
};

