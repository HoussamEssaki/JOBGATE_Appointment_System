import React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Fab,
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  Event,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { AppointmentBookingForm } from '../../components/forms/AppointmentBookingForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { APPOINTMENT_STATUS } from '../../constants';
import type { Appointment } from '../../types';

export const AppointmentsPage: React.FC = () => {
  const { isTalent, isUniversityStaff } = useAuth();
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
  });
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Mock data for now - replace with actual hooks when backend is connected
  const appointmentsLoading = false;
  const appointmentsData = {
    results: [] as Appointment[],
    count: 0,
    next: null,
    previous: null,
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    // Navigate to appointment details
    console.log('View appointment:', appointment.id);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // Open edit form
    console.log('Edit appointment:', appointment.id);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    // Show confirmation and cancel
    console.log('Cancel appointment:', appointment.id);
  };

  const handleConfirmAppointment = (appointment: Appointment) => {
    // Confirm appointment
    console.log('Confirm appointment:', appointment.id);
  };

  const handleCompleteAppointment = (appointment: Appointment) => {
    // Mark as complete
    console.log('Complete appointment:', appointment.id);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: '',
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (appointmentsLoading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {isTalent ? 'My Appointments' : 'Appointments'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isTalent 
              ? 'View and manage your scheduled appointments'
              : 'Manage appointments and bookings'
            }
          </Typography>
        </Box>

        {isTalent && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowBookingForm(true)}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterList />
          <Typography variant="h6">Filters</Typography>
          {hasActiveFilters && (
            <Button size="small" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search appointments..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={APPOINTMENT_STATUS.PENDING}>Pending</MenuItem>
                <MenuItem value={APPOINTMENT_STATUS.CONFIRMED}>Confirmed</MenuItem>
                <MenuItem value={APPOINTMENT_STATUS.COMPLETED}>Completed</MenuItem>
                <MenuItem value={APPOINTMENT_STATUS.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="From Date"
              value={filters.date_from ? new Date(filters.date_from) : null}
              onChange={(date) => {
                handleFilterChange('date_from', date ? date.toISOString().split('T')[0] : '');
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="To Date"
              value={filters.date_to ? new Date(filters.date_to) : null}
              onChange={(date) => {
                handleFilterChange('date_to', date ? date.toISOString().split('T')[0] : '');
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </Grid>
        </Grid>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {filters.search && (
              <Chip
                label={`Search: ${filters.search}`}
                onDelete={() => handleFilterChange('search', '')}
                size="small"
              />
            )}
            {filters.status && (
              <Chip
                label={`Status: ${filters.status}`}
                onDelete={() => handleFilterChange('status', '')}
                size="small"
              />
            )}
            {filters.date_from && (
              <Chip
                label={`From: ${filters.date_from}`}
                onDelete={() => handleFilterChange('date_from', '')}
                size="small"
              />
            )}
            {filters.date_to && (
              <Chip
                label={`To: ${filters.date_to}`}
                onDelete={() => handleFilterChange('date_to', '')}
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Results */}
      {appointmentsData.results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {hasActiveFilters 
              ? 'Try adjusting your filters to see more results.'
              : isTalent 
                ? "You haven't booked any appointments yet."
                : 'No appointments have been scheduled yet.'
            }
          </Typography>
          {isTalent && !hasActiveFilters && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowBookingForm(true)}
            >
              Book Your First Appointment
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Results Summary */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {appointmentsData.results.length} of {appointmentsData.count} appointments
            </Typography>
          </Box>

          {/* Appointments Grid */}
          <Grid container spacing={3}>
            {appointmentsData.results.map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onView={handleViewAppointment}
                  onEdit={handleEditAppointment}
                  onCancel={handleCancelAppointment}
                  onConfirm={handleConfirmAppointment}
                  onComplete={handleCompleteAppointment}
                  userRole={isTalent ? 'talent' : isUniversityStaff ? 'university_staff' : 'admin'}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {appointmentsData.count > 12 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(appointmentsData.count / 12)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button for Mobile */}
      {isTalent && (
        <Fab
          color="primary"
          aria-label="book appointment"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={() => setShowBookingForm(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Booking Form Dialog */}
      <AppointmentBookingForm
        open={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSubmit={async (data) => {
          console.log('Book appointment:', data);
          // Handle booking submission
        }}
        availableSlots={[]} // Replace with actual slots
      />
    </Box>
  );
};

