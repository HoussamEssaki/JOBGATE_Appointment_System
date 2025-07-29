// src/pages/Calendar/CalendarPage.tsx
import { useState } from 'react';
import { apiMethods } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, ViewWeek, ViewModule } from '@mui/icons-material';
import { CalendarView } from '../../components/ui/CalendarView';
import { CalendarSlotForm } from '../../components/forms/CalendarSlotForm';
import { AppointmentBookingForm } from '../../components/forms/AppointmentBookingForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import type { CalendarSlot, Appointment, Agenda, AppointmentTheme } from '../../types';

// ------------------------------------------------------------------
// Helper that turns whatever the server returned into a safe array
// ------------------------------------------------------------------
async function safeGet<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await apiMethods.get<T[]>(endpoint);
    return Array.isArray(res) ? res : [];
  } catch (e) {
    console.warn(`GET ${endpoint} failed – treating as empty list`, e);
    return [];
  }
}

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { isTalent, isUniversityStaff, isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [slotDetailsOpen, setSlotDetailsOpen] = useState(false);

  // ----------------------------------------------------------------
  // React-Query hooks (with safeGet wrapper)
  // ----------------------------------------------------------------
  const { data: themes = [], isLoading: themesLoading } = useQuery<AppointmentTheme[]>({
    queryKey: ['appointmentThemes'],
    queryFn: () => safeGet('/appointments/themes/'),
  });

  const { data: agendas = [], isLoading: agendasLoading } = useQuery<Agenda[]>({
    queryKey: ['agendas'],
    queryFn: () => safeGet('/appointments/agendas/'),
  });

  const { data: slots = [], isLoading: slotsLoading, refetch: refetchSlots } = useQuery<CalendarSlot[]>({
    queryKey: ['calendarSlots'],
    queryFn: () => safeGet('/appointments/slots/'),
  });

  const { data: appointments = [], isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => safeGet('/appointments/'),
  });

  // ----------------------------------------------------------------
  // UI helpers
  // ----------------------------------------------------------------
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (isTalent) setShowBookingForm(true);
  };

  const handleSlotClick = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    setSlotDetailsOpen(true);
  };

  const handleCreateSlot = (date: Date) => {
    setSelectedDate(date);
    setShowSlotForm(true);
  };

  const handleSlotFormSubmit = async (data: any) => {
    try {
      const payload = {
      ...data,
      staff_id: user?.id, // <-- inject current user id
    };

      data.id
        ? await apiMethods.patch(`/appointments/slots/${data.id}/`, payload)
        : await apiMethods.post('/appointments/slots/', payload);
      setShowSlotForm(false);
      setSelectedDate(null);
      refetchSlots();
    } catch (error : any) {
      console.error('Failed to save slot:', error);
      console.error('Backend says:', error.response?.data);
      alert('Failed to save slot. Please try again.');
    }
  };

  const handleBookingSubmit = async (data: any) => {
    try {
      await apiMethods.post('/appointments/', data);
      setShowBookingForm(false);
      setSelectedDate(null);
      refetchAppointments();
      refetchSlots();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const getAvailableSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(
      (slot) =>
        slot.slot_date === dateString &&
        slot.is_active &&
        slot.current_bookings < slot.max_capacity
    );
  };

  // ----------------------------------------------------------------
  // Skeleton loaders for each card
  // ----------------------------------------------------------------
  const showSkeleton = (themesLoading || agendasLoading || slotsLoading || appointmentsLoading);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isTalent
              ? 'View available appointment slots and your bookings'
              : 'Manage your calendar and appointment slots'}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          {(isUniversityStaff || isAdmin) && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setShowSlotForm(true)}>
              Create Slot
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Theme</InputLabel>
              <Select
                value={selectedTheme}
                label="Filter by Theme"
                onChange={(e) => setSelectedTheme(e.target.value)}
              >
                <MenuItem value="">All Themes</MenuItem>
                {themes.map((theme) => (
                  <MenuItem key={theme.id} value={theme.id}>
                    {theme.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant={viewMode === 'month' ? 'contained' : 'outlined'}
                startIcon={<ViewModule />}
                onClick={() => setViewMode('month')}
                size="small"
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                startIcon={<ViewWeek />}
                onClick={() => setViewMode('week')}
                size="small"
                disabled
              >
                Week
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              {selectedTheme && (
                <Chip
                  label={`Theme: ${themes.find((t) => t.id === +selectedTheme)?.name ?? 'Unknown'}`}
                  onDelete={() => setSelectedTheme('')}
                  size="small"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {showSkeleton ? (
        <LoadingSpinner message="Loading calendar..." />
      ) : (
        <>
          {/* Calendar */}
          <CalendarView
            slots={
              selectedTheme
                ? slots.filter((s) => s.agenda.theme.id === +selectedTheme)
                : slots
            }
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onDateClick={handleDateClick}
            onCreateSlot={handleCreateSlot}
            showCreateButton={isUniversityStaff || isAdmin}
            userRole={
              isTalent ? 'talent' : isUniversityStaff ? 'university_staff' : 'admin'
            }
          />

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {slots.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Slots
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {slots.filter((s) => s.current_bookings < s.max_capacity).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Slots
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {appointments.filter((a) => a.status === 'confirmed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confirmed Appointments
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {slots.reduce((sum, s) => sum + s.current_bookings, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* ---------- Dialogs & Forms ---------- */}
      <Dialog open={slotDetailsOpen} onClose={() => setSlotDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Slot Details</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedSlot.agenda.name}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {selectedSlot.slot_date} at {selectedSlot.start_time} – {selectedSlot.end_time}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1">
                    {selectedSlot.current_bookings} / {selectedSlot.max_capacity} booked
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Meeting Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedSlot.meeting_type === 'in_person' ? '🏢 In Person' : ''}
                    {selectedSlot.meeting_type === 'online' ? '💻 Online' : ''}
                    {selectedSlot.meeting_type === 'phone' ? '📞 Phone' : ''}
                  </Typography>
                </Grid>

                {selectedSlot.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">{selectedSlot.location}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Theme
                  </Typography>
                  <Chip label={selectedSlot.agenda.theme.name} size="small" color="primary" />
                </Grid>

                {selectedSlot.agenda.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedSlot.agenda.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDetailsOpen(false)}>Close</Button>
          {isTalent &&
            selectedSlot &&
            selectedSlot.current_bookings < selectedSlot.max_capacity && (
              <Button
                variant="contained"
                onClick={() => {
                  setSlotDetailsOpen(false);
                  setShowBookingForm(true);
                }}
              >
                Book This Slot
              </Button>
            )}
        </DialogActions>
      </Dialog>

      <CalendarSlotForm
        open={showSlotForm}
        onClose={() => {
          setShowSlotForm(false);
          setSelectedDate(null);
        }}
        onSubmit={handleSlotFormSubmit}
        agendas={agendas}
        initialData={
          selectedDate
            ? { slot_date: selectedDate.toISOString().split('T')[0] }
            : undefined
        }
      />

      <AppointmentBookingForm
        open={showBookingForm}
        onClose={() => {
          setShowBookingForm(false);
          setSelectedDate(null);
        }}
        onSubmit={handleBookingSubmit}
        availableSlots={selectedDate ? getAvailableSlotsForDate(selectedDate) : []}
      />
    </Box>
  );
};