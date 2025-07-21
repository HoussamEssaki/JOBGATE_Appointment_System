import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Event,
  Person,
  LocationOn,
  VideoCall,
  Phone,
  CheckCircle,
  FilterList,
  Search,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MEETING_TYPES } from '../../constants';
import type { Agenda, CalendarSlot, AppointmentTheme, UniversityProfile, User } from '../../types';

const steps = ['Select Agenda', 'Choose Time Slot', 'Confirm Details'];

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useAuth();

  /* ------------------------------------------------------------------ */
  /* STATE                                                              */
  /* ------------------------------------------------------------------ */
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [talentNotes, setTalentNotes] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  /* Filters */
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');

  /* ------------------------------------------------------------------ */
  /* MOCK DATA – cast to the expected types                             */
  /* ------------------------------------------------------------------ */
  const agendasLoading = false;
  const slotsLoading = false;

  const themes: AppointmentTheme[] = [
    { id: 1, name: 'Resume Help', color_code: '#2196F3', icon: 'description', is_active: true },
    { id: 2, name: 'Interview Prep', color_code: '#4CAF50', icon: 'record_voice_over', is_active: true },
    { id: 3, name: 'Career Counseling', color_code: '#FF9800', icon: 'psychology', is_active: true },
    { id: 4, name: 'Job Search Strategy', color_code: '#9C27B0', icon: 'work', is_active: true },
  ];

  const agendas: Agenda[] = [
    {
      id: 1,
      name: 'Resume Review Session',
      description: 'One-on-one resume review and feedback',
      theme: themes[0],
      slot_duration_minutes: 60,
      max_capacity_per_slot: 1,
      start_date: '2024-01-15',
      end_date: '2024-03-15',
      is_recurring: true,
      recurrence_pattern: { type: 'weekly', interval: 1 } as Record<string, any>,
      booking_deadline_hours: 24,
      cancellation_deadline_hours: 12,
      is_active: true,
      university: {
        id: 1,
        display_name: 'University Career Center',
        base_user: { id: 99, first_name: 'System', last_name: 'Admin', email: 'admin@university.edu', username: 'sysadmin', user_type: 'admin', is_active: true, date_joined: '2024-01-01' },
        created_by: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as UniversityProfile,
      created_by: { id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@university.edu', username: 'jane', user_type: 'university_staff', is_active: true, date_joined: '2024-01-01' } as User,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Interview Preparation Workshop',
      description: 'Practice interviews and receive feedback',
      theme: themes[1],
      slot_duration_minutes: 90,
      max_capacity_per_slot: 3,
      start_date: '2024-01-20',
      end_date: '2024-04-20',
      is_recurring: true,
      recurrence_pattern: { type: 'weekly', interval: 2 } as Record<string, any>,
      booking_deadline_hours: 48,
      cancellation_deadline_hours: 24,
      is_active: true,
      university: {
        id: 1,
        display_name: 'University Career Center',
        base_user: { id: 99, first_name: 'System', last_name: 'Admin', email: 'admin@university.edu', username: 'sysadmin', user_type: 'admin', is_active: true, date_joined: '2024-01-01' },
        created_by: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as UniversityProfile,
      created_by: { id: 1, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@university.edu', username: 'jane', user_type: 'university_staff', is_active: true, date_joined: '2024-01-01' } as User,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ] as Agenda[];

  const availableSlots: CalendarSlot[] = [
    {
      id: 1,
      agenda: agendas[0],
      slot_date: '2024-01-22',
      start_time: '10:00',
      end_time: '11:00',
      max_capacity: 1,
      current_bookings: 0,
      status: 'available',
      location: 'Career Center Room 101',
      meeting_type: 'in_person',
      meeting_link: '',
      notes: 'Please bring your current resume',
      staff: { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@university.edu', username: 'jane', user_type: 'university_staff', is_active: true, date_joined: '2024-01-10' } as User,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      agenda: agendas[0],
      slot_date: '2024-01-22',
      start_time: '14:00',
      end_time: '15:00',
      max_capacity: 1,
      current_bookings: 0,
      status: 'available',
      location: '',
      meeting_type: 'online',
      meeting_link: 'https://zoom.us/j/123456789',
      notes: 'Online session via Zoom',
      staff: { id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@university.edu', username: 'bob', user_type: 'university_staff', is_active: true, date_joined: '2024-01-01' } as User,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ] as CalendarSlot[];

  /* ------------------------------------------------------------------ */
  /* HOOKS / HELPERS                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const agendaId = searchParams.get('agenda');
    if (agendaId) {
      const agenda = agendas.find(a => a.id === parseInt(agendaId));
      if (agenda) {
        setSelectedAgenda(agenda);
        setActiveStep(1);
      }
    }
  }, [searchParams]);

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleAgendaSelect = (agenda: Agenda) => {
    setSelectedAgenda(agenda);
    handleNext();
  };
  const handleSlotSelect = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    handleNext();
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedAgenda) return;
    setBookingSuccess(true);
    setConfirmDialogOpen(false);
    setTimeout(() => navigate('/appointments/1'), 2000);
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case MEETING_TYPES.ONLINE: return <VideoCall />;
      case MEETING_TYPES.PHONE:   return <Phone />;
      default:                    return <LocationOn />;
    }
  };

  const filteredAgendas = agendas.filter(agenda => {
    const matchesSearch = agenda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (agenda.description && agenda.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTheme = !selectedTheme || agenda.theme.id === parseInt(selectedTheme);
    const matchesUniversity = !selectedUniversity || agenda.university.id === parseInt(selectedUniversity);
    return matchesSearch && matchesTheme && matchesUniversity;
  });

  const filteredSlots = availableSlots.filter(slot => {
    if (!selectedAgenda || slot.agenda.id !== selectedAgenda.id) return false;
    if (!selectedDate) return true;
    return new Date(slot.slot_date).toDateString() === new Date(selectedDate).toDateString();
  });

  if (bookingSuccess) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Appointment Booked Successfully!</Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
          You will receive a confirmation email shortly.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/appointments')}>
          View My Appointments
        </Button>
      </Box>
    );
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Book an Appointment</Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </Paper>

      {/* STEP 0 – Select Agenda */}
      {activeStep === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Find the Right Agenda</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search agendas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} label="Theme">
                    <MenuItem value="">All Themes</MenuItem>
                    {themes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>University</InputLabel>
                  <Select value={selectedUniversity} onChange={e => setSelectedUniversity(e.target.value)} label="University">
                    <MenuItem value="">All Universities</MenuItem>
                    <MenuItem value="1">University Career Center</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" startIcon={<FilterList />} sx={{ height: 56 }}>
                  More Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Agendas List */}
          <Grid container spacing={3}>
            {agendasLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Card><CardContent><Skeleton variant="text" width="60%" height={32} /></CardContent></Card>
                  </Grid>
                ))
              : filteredAgendas.length === 0
              ? (
                  <Grid item xs={12}>
                    <Alert severity="info">No agendas found matching your criteria.</Alert>
                  </Grid>
                )
              : filteredAgendas.map(agenda => (
                  <Grid item xs={12} md={6} key={agenda.id}>
                    <Card
                      sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}
                      onClick={() => handleAgendaSelect(agenda)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: agenda.theme.color_code, mr: 2 }}><Event /></Avatar>
                          <Box flex={1}>
                            <Typography variant="h6">{agenda.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{agenda.description}</Typography>
                          </Box>
                        </Box>
                        <Chip label={agenda.theme.name} size="small" sx={{ bgcolor: agenda.theme.color_code, color: 'white' }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        </Box>
      )}

      {/* STEP 1 – Choose Slot */}
      {activeStep === 1 && selectedAgenda && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Selected Agenda</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Avatar sx={{ bgcolor: selectedAgenda.theme.color_code, mr: 2 }}><Event /></Avatar>
              <Typography variant="body1">{selectedAgenda.name}</Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={handleBack} sx={{ mt: 1 }}>Change Agenda</Button>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Filter by Date</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <DatePicker label="Select Date" value={selectedDate} onChange={setSelectedDate} slotProps={{ textField: { fullWidth: true } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button variant="outlined" onClick={() => setSelectedDate(null)} disabled={!selectedDate}>Clear Filter</Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Available Time Slots</Typography>
            {slotsLoading ? <LoadingSpinner /> :
              filteredSlots.length === 0 ? <Alert severity="info">No slots for this date.</Alert> :
                <List>
                  {filteredSlots.map((slot, idx) => (
                    <React.Fragment key={slot.id}>
                      <ListItem sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => handleSlotSelect(slot)}>
                        <ListItemAvatar><Avatar><CalendarToday /></Avatar></ListItemAvatar>
                        <ListItemText
                          primary={`${new Date(slot.slot_date).toLocaleDateString()} at ${slot.start_time} - ${slot.end_time}`}
                          secondary={
                            <>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Person fontSize="small" /> {slot.staff.first_name} {slot.staff.last_name}
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                {getMeetingIcon(slot.meeting_type)} {slot.meeting_type.replace('_', ' ')}
                              </Box>
                            </>
                          }
                        />
                        <Button variant="outlined" size="small">Select</Button>
                      </ListItem>
                      {idx < filteredSlots.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
            }
          </Paper>
        </Box>
      )}

      {/* STEP 2 – Confirm */}
      {activeStep === 2 && selectedAgenda && selectedSlot && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Confirm Your Appointment</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Agenda</Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Avatar sx={{ bgcolor: selectedAgenda.theme.color_code, mr: 2 }}><Event /></Avatar>
                  <Typography variant="body1">{selectedAgenda.name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Appointment Details</Typography>
                <Typography variant="body2">{new Date(selectedSlot.slot_date).toLocaleDateString()} at {selectedSlot.start_time} - {selectedSlot.end_time}</Typography>
                <Typography variant="body2">{selectedSlot.staff.first_name} {selectedSlot.staff.last_name}</Typography>
                <Typography variant="body2">{selectedSlot.meeting_type.replace('_', ' ')}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Additional Information</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes or Questions (Optional)"
              value={talentNotes}
              onChange={e => setTalentNotes(e.target.value)}
              placeholder="Share any specific topics..."
            />
          </Paper>

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={handleBack}>Back</Button>
            <Button variant="contained" onClick={() => setConfirmDialogOpen(true)} size="large">Book Appointment</Button>
          </Box>
        </Box>
      )}

      {/* CONFIRM DIALOG */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Appointment Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Are you sure you want to book this appointment?</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            You can cancel up to {selectedAgenda?.cancellation_deadline_hours} hours before the session.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBookAppointment} variant="contained">Confirm Booking</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};