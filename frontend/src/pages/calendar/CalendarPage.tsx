import { useState } from 'react';
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
import {
  Add,
  ViewWeek,
  ViewModule,
} from '@mui/icons-material';
import { CalendarView } from '../../components/ui/CalendarView';
import { CalendarSlotForm } from '../../components/forms/CalendarSlotForm';
import { AppointmentBookingForm } from '../../components/forms/AppointmentBookingForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import type { CalendarSlot, Appointment, Agenda } from '../../types';

export const CalendarPage: React.FC = () => {
  const { isTalent, isUniversityStaff, isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [slotDetailsOpen, setSlotDetailsOpen] = useState(false);

  // Mock data - replace with actual API calls
  const slotsLoading = false;
  const slots: CalendarSlot[] = [];
  const appointments: Appointment[] = [];
  const agendas: Agenda[] = [];
  const themes: { id: number; name: string }[] = [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (isTalent) {
      // For talents, show available slots for booking
      setShowBookingForm(true);
    }
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
    console.log('Create/Edit slot:', data);
    // Handle slot creation/editing
  };

  const handleBookingSubmit = async (data: any) => {
    console.log('Book appointment:', data);
    // Handle appointment booking
  };

  const getAvailableSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(slot => 
      slot.slot_date === dateString && 
      slot.is_active && 
      slot.current_bookings < slot.max_capacity
    );
  };

  if (slotsLoading) {
    return <LoadingSpinner message="Loading calendar..." />;
  }

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
              : 'Manage your calendar and appointment slots'
            }
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          {(isUniversityStaff || isAdmin) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowSlotForm(true)}
            >
              Create Slot
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters and Controls */}
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
                {themes.map((theme: any) => (
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
                disabled // Week view not implemented yet
              >
                Week
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              {selectedTheme && (
                <Chip
                  label={`Theme: ${themes.find((t: any) => t.id === selectedTheme)?.name || 'Unknown'}`}
                  onDelete={() => setSelectedTheme('')}
                  size="small"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Calendar */}
      <CalendarView
        slots={selectedTheme ? slots.filter(slot => slot.agenda.theme.id === parseInt(selectedTheme)) : slots}
        appointments={appointments}
        onSlotClick={handleSlotClick}
        onDateClick={handleDateClick}
        onCreateSlot={handleCreateSlot}
        showCreateButton={isUniversityStaff || isAdmin}
        userRole={isTalent ? 'talent' : isUniversityStaff ? 'university_staff' : 'admin'}
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
              {slots.filter(slot => slot.current_bookings < slot.max_capacity).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Slots
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confirmed Appointments
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {slots.reduce((sum, slot) => sum + slot.current_bookings, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Bookings
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Slot Details Dialog */}
      <Dialog
        open={slotDetailsOpen}
        onClose={() => setSlotDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Slot Details
        </DialogTitle>
        <DialogContent>
  {selectedSlot && (
    <Box>
      <Typography variant="h6" gutterBottom>
        {selectedSlot.agenda.name}
      </Typography>

      <Grid container spacing={2}>
        {/* Date & Time */}
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Date & Time
          </Typography>
          <Typography variant="body1">
            {selectedSlot.slot_date} at {selectedSlot.start_time} -{" "}
            {selectedSlot.end_time}
          </Typography>
        </Grid>

        {/* Capacity */}
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Capacity
          </Typography>
          <Typography variant="body1">
            {selectedSlot.current_bookings} / {selectedSlot.max_capacity} booked
          </Typography>
        </Grid>

        {/* Meeting Type */}
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Meeting Type
          </Typography>
          <Typography variant="body1">
            {selectedSlot.meeting_type === "in_person" && "🏢 In Person"}
            {selectedSlot.meeting_type === "online" && "💻 Online"}
            {selectedSlot.meeting_type === "phone" && "📞 Phone"}
          </Typography>
        </Grid>

        {/* Location */}
        {selectedSlot.location && (
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">
              {selectedSlot.location}
            </Typography>
          </Grid>
        )}

        {/* Theme */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Theme
          </Typography>
          <Chip
            label={selectedSlot.agenda.theme.name}
            size="small"
            color="primary"
          />
        </Grid>

        {/* Description */}
        {selectedSlot.agenda.description && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {selectedSlot.agenda.description}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )}
</DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDetailsOpen(false)}>
            Close
          </Button>
          {isTalent && selectedSlot && selectedSlot.current_bookings < selectedSlot.max_capacity && (
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

      {/* Slot Creation/Edit Form */}
      <CalendarSlotForm
        open={showSlotForm}
        onClose={() => {
          setShowSlotForm(false);
          setSelectedDate(null);
        }}
        onSubmit={handleSlotFormSubmit}
        agendas={agendas}
        initialData={selectedDate ? {
          slot_date: selectedDate.toISOString().split('T')[0],
        } : undefined}
      />

      {/* Appointment Booking Form */}
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

