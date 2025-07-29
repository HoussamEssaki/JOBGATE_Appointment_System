import { create } from 'zustand';
import type { NotificationState, LoadingState } from '../types';

interface UIState {
  // Loading states
  loading: LoadingState;
  
  // Notification state
  notification: NotificationState;
  
  // Modal states
  modals: {
    appointmentBooking: boolean;
    appointmentDetails: boolean;
    agendaCreate: boolean;
    slotCreate: boolean;
    profileEdit: boolean;
    confirmDialog: boolean;
  };
  
  // Sidebar state
  sidebarOpen: boolean;
  
  // Theme preference
  darkMode: boolean;
  
  // Selected items
  selectedAppointment: number | null;
  selectedAgenda: number | null;
  selectedSlot: number | null;
}

interface UIActions {
  // Loading actions
  setLoading: (key: string, loading: boolean) => void;
  clearAllLoading: () => void;
  
  // Notification actions
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  hideNotification: () => void;
  
  // Modal actions
  openModal: (modalName: keyof UIState['modals']) => void;
  closeModal: (modalName: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme actions
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  
  // Selection actions
  setSelectedAppointment: (id: number | null) => void;
  setSelectedAgenda: (id: number | null) => void;
  setSelectedSlot: (id: number | null) => void;
  clearSelections: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  loading: {},
  notification: {
    open: false,
    message: '',
    severity: 'info',
  },
  modals: {
    appointmentBooking: false,
    appointmentDetails: false,
    agendaCreate: false,
    slotCreate: false,
    profileEdit: false,
    confirmDialog: false,
  },
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  selectedAppointment: null,
  selectedAgenda: null,
  selectedSlot: null,

  // Loading actions
  setLoading: (key, loading) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: loading,
      },
    }));
  },

  clearAllLoading: () => {
    set({ loading: {} });
  },

  // Notification actions
  showNotification: (message, severity = 'info') => {
    set({
      notification: {
        open: true,
        message,
        severity,
      },
    });
  },

  hideNotification: () => {
    set((state) => ({
      notification: {
        ...state.notification,
        open: false,
      },
    }));
  },

  // Modal actions
  openModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: true,
      },
    }));
  },

  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: false,
      },
    }));
  },

  closeAllModals: () => {
    set((state) => ({
      modals: Object.keys(state.modals).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false,
        }),
        {} as UIState['modals']
      ),
    }));
  },

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  // Theme actions
  toggleDarkMode: () => {
    const { darkMode } = get();
    const newDarkMode = !darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    set({ darkMode: newDarkMode });
  },

  setDarkMode: (darkMode) => {
    localStorage.setItem('darkMode', String(darkMode));
    set({ darkMode });
  },

  // Selection actions
  setSelectedAppointment: (id) => {
    set({ selectedAppointment: id });
  },

  setSelectedAgenda: (id) => {
    set({ selectedAgenda: id });
  },

  setSelectedSlot: (id) => {
    set({ selectedSlot: id });
  },

  clearSelections: () => {
    set({
      selectedAppointment: null,
      selectedAgenda: null,
      selectedSlot: null,
    });
  },
}));

