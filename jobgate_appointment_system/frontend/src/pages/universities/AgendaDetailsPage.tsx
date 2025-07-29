/* AgendaDetailsPage.tsx — fully fixed & type-safe */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiMethods } from '../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Event,
  Add,
  Visibility,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* 1. Minimal, self-contained types                                   */
/* ------------------------------------------------------------------ */
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  user_type: 'student' | 'staff' | 'admin' | 'talent';
  is_active: boolean;
  date_joined: string;
}

interface UniversityProfile {
  id: number;
  display_name: string;
  base_user: User;          // ← required, no longer undefined
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface AppointmentTheme {
  id: number;
  name: string;
  color_code: string;
  icon: string;
  is_active: boolean;
}

interface RecurrencePattern {
  type: 'weekly' | 'bi-weekly' | 'monthly';
}

interface Agenda {
  id: number;
  name: string;
  description?: string;
  theme: AppointmentTheme;
  slot_duration_minutes: number;
  max_capacity_per_slot: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  booking_deadline_hours: number;
  cancellation_deadline_hours: number;
  is_active: boolean;
  university: UniversityProfile;
  created_by: User;
  created_at: string;
  updated_at: string;
}

interface CalendarSlot {
  id: number;
  agenda: Agenda;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  status: 'available' | 'fully_booked' | 'cancelled' | 'blocked';
  location: string;
  meeting_type: 'in_person' | 'online';
  meeting_link: string;
  notes?: string;
  staff: User;
  created_at: string;
  updated_at: string;
  available_capacity: number;
  is_active: boolean;
}

interface Appointment {
  id: number;
  booking_reference: string;
  status: 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  talent: User;
  calendar_slot: CalendarSlot;
  talent_notes?: string;
  staff_notes?: string;
  rating?: number;
  feedback?: string;
  booked_at: string;
  created_at: string;
  updated_at: string;
  reminder_sent_24h: boolean;
  reminder_sent_1h: boolean;
  confirmation_sent: boolean;
}

/* ------------------------------------------------------------------ */
/* 2. Dummy user stub so base_user is never undefined                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 3. Tab Panel Helper                                                */
/* ------------------------------------------------------------------ */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Component                                                       */
/* ------------------------------------------------------------------ */
export const AgendaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isUniversityStaff, isAdmin } = useAuth();

  /* -------------------- State -------------------- */
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [addSlotDialogOpen, setAddSlotDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [newSlot, setNewSlot] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    meetingType: 'in_person' as 'in_person' | 'online',
    meetingLink: '',
    notes: '',
    maxCapacity: 1,
  });

  /* -------------------- Mock Fetch -------------------- */
  const fetchAgendaDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const agendaResponse = await apiMethods.get<Agenda>(`appointments/agendas/${id}/`);
        setAgenda(agendaResponse);

        const slotsResponse = await apiMethods.get<CalendarSlot[]>(`appointments/slots/?agenda_id=${id}`);
        setSlots(slotsResponse);

        const appointmentsResponse = await apiMethods.get<Appointment[]>(`appointments/?agenda_id=${id}`);
        setAppointments(appointmentsResponse);

      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch agenda details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAgendaDetails();
  }, [id]);

  /* -------------------- Handlers -------------------- */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleAddSlot = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          agenda: agenda?.id, // Assuming agenda ID is required
          slot_date: newSlot.date.toISOString().split("T")[0],
          start_time: newSlot.startTime.toTimeString().split(" ")[0].substring(0, 5),
          end_time: newSlot.endTime.toTimeString().split(" ")[0].substring(0, 5),
          max_capacity: newSlot.maxCapacity,
          location: newSlot.location,
          meeting_type: newSlot.meetingType,
          meeting_link: newSlot.meetingLink,
          notes: newSlot.notes,
          // staff will be automatically assigned by the backend based on the logged-in user
        };
        await apiMethods.post("appointments/slots/", payload);
        setAddSlotDialogOpen(false);
        fetchAgendaDetails(); // refresh data
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to add time slot.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteAgenda = async () => {
      setLoading(true);
      setError(null);
      try {
        await apiMethods.delete(`appointments/agendas/${id}/`);
        setDeleteDialogOpen(false);
        navigate("/universities/agendas");
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to delete agenda.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'fully_booked': return 'error';
      case 'cancelled': return 'default';
      case 'blocked': return 'warning';
      default: return 'default';
    }
  };

  /* -------------------- Guards -------------------- */
  if (!isUniversityStaff && !isAdmin)
    return (
      <Box p={3}>
        <Alert severity="warning">You do not have permission to view this page.</Alert>
      </Box>
    );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading agenda details...</Typography>
      </Box>
    );

  if (error || !agenda)
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Agenda not found'}</Alert>
        <Button onClick={fetchAgendaDetails} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );

  /* -------------------- Render -------------------- */
  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>{agenda.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {agenda.university.display_name}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/universities/agendas/${agenda.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: agenda.theme.color_code, mr: 2, width: 56, height: 56 }}>
                <Event />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>{agenda.name}</Typography>
                <Chip label={agenda.is_active ? 'Active' : 'Inactive'} color={agenda.is_active ? 'success' : 'default'} />
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" mb={2}>
              {agenda.description}
            </Typography>
            <Chip
              label={agenda.theme.name}
              sx={{ bgcolor: agenda.theme.color_code, color: 'white' }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Slots</Typography>
                  <Typography variant="h6">{slots.length}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                  <Typography variant="h6">{appointments.length}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Duration per Slot</Typography>
                  <Typography variant="h6">{agenda.slot_duration_minutes} min</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Max Capacity</Typography>
                  <Typography variant="h6">{agenda.max_capacity_per_slot}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Time Slots" />
          <Tab label="Appointments" />
          <Tab label="Settings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Time Slots</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddSlotDialogOpen(true)}>
              Add Time Slot
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Location/Type</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.length ? (
                  slots.map(slot => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        <Typography variant="body2">{new Date(slot.slot_date).toLocaleDateString()}</Typography>
                        <Typography variant="body2" color="text.secondary">{slot.start_time} - {slot.end_time}</Typography>
                      </TableCell>
                      <TableCell>{slot.staff.first_name} {slot.staff.last_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {slot.meeting_type.replace('_', ' ')}
                        </Typography>
                        {slot.location && (
                          <Typography variant="body2" color="text.secondary">{slot.location}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{slot.current_bookings}/{slot.max_capacity}</TableCell>
                      <TableCell>
                        <Chip
                          label={slot.status.replace('_', ' ')}
                          color={getStatusColor(slot.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => navigate(`/universities/slots/${slot.id}`)}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigate(`/universities/slots/${slot.id}/edit`)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No time slots created yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Appointments</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Talent</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length ? (
                  appointments.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.booking_reference}</TableCell>
                      <TableCell>{app.talent.first_name} {app.talent.last_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(app.calendar_slot.slot_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.calendar_slot.start_time} - {app.calendar_slot.end_time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status}
                          color={app.status === 'confirmed' ? 'success' : 'default'}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => navigate(`/appointments/${app.id}`)}>
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No appointments booked yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Agenda Settings</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body1" mb={2}>{agenda.slot_duration_minutes} minutes per slot</Typography>

              <Typography variant="body2" color="text.secondary">Capacity</Typography>
              <Typography variant="body1" mb={2}>{agenda.max_capacity_per_slot} participant(s) per slot</Typography>

              <Typography variant="body2" color="text.secondary">Active Period</Typography>
              <Typography variant="body1" mb={2}>
                {new Date(agenda.start_date).toLocaleDateString()} - {new Date(agenda.end_date).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Recurring</Typography>
              <Typography variant="body1" mb={2}>
                {agenda.is_recurring ? `Yes (${agenda.recurrence_pattern?.type})` : 'No'}
              </Typography>

              <Typography variant="body2" color="text.secondary">Booking Deadline</Typography>
              <Typography variant="body1" mb={2}>{agenda.booking_deadline_hours} hours before appointment</Typography>

              <Typography variant="body2" color="text.secondary">Cancellation Deadline</Typography>
              <Typography variant="body1" mb={2}>{agenda.cancellation_deadline_hours} hours before appointment</Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      /* -------------------- Dialogs -------------------- */
      <Dialog open={addSlotDialogOpen} onClose={() => setAddSlotDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Time Slot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={newSlot.date}
                onChange={d => setNewSlot({ ...newSlot, date: d || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="Start Time"
                value={newSlot.startTime}
                onChange={t => setNewSlot({ ...newSlot, startTime: t || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="End Time"
                value={newSlot.endTime}
                onChange={t => setNewSlot({ ...newSlot, endTime: t || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newSlot.location}
                onChange={e => setNewSlot({ ...newSlot, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={newSlot.notes}
                onChange={e => setNewSlot({ ...newSlot, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSlotDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSlot} variant="contained">Add Slot</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Agenda</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this agenda? This action cannot be undone and will also
            delete all associated time slots and appointments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAgenda} color="error" variant="contained">
            Delete Agenda
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};