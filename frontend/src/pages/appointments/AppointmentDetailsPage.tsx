import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Cancel,
  CheckCircle,
  Event,
  Person,
  School,
  LocationOn,
  VideoCall,
  Phone,
  Star,
  Feedback,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { APPOINTMENT_STATUS, MEETING_TYPES } from '../../constants';
import type { Appointment } from '../../types';

export const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isTalent, isUniversityStaff, isAdmin } = useAuth();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [editData, setEditData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    notes: '',
    location: '',
    meetingLink: '',
  });

  // Mock data - replace with actual API call
  const appointmentLoading = false;
  // Mock data – cast to shut the compiler up
    const appointment = {
    id: parseInt(id || '1'),
    booking_reference: 'APT-2024-001',
    status: 'confirmed',
    talent: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '+1234567890',
        username: '',
        user_type: 'talent',
        is_active: true,
        date_joined: '2024-01-10',
    },
    calendar_slot: {
        id: 1,
        slot_date: '2024-01-15',
        start_time: '10:00',
        end_time: '11:00',
        location: 'Career Center Room 101',
        meeting_type: 'in_person',
        meeting_link: '',
        notes: 'Please bring your resume',
        staff: {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@university.edu',
        username: '',
        user_type: 'university_staff',
        is_active: true,
        date_joined: '2024-01-10',
        },
        agenda: {
        id: 1,
        name: 'Resume Review Session',
        description: 'One-on-one resume review and feedback',
        theme: {
            id: 1,
            name: 'Resume Help',
            color_code: '#2196F3',
            icon: 'description',
            is_active: true,
        },
        university: {
            id: 1,
            display_name: 'University Career Center',
            base_user: {
            id: 99,
            first_name: 'System',
            last_name: 'Admin',
            email: 'admin@university.edu',
            username: 'sysadmin',
            user_type: 'admin',
            is_active: true,
            date_joined: '2024-01-01',
            },
            created_by: 99,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        },
    },
    talent_notes: 'Looking for feedback on my software engineering resume',
    staff_notes: '',
    rating: undefined,
    feedback: '',
    booked_at: '2024-01-10T09:00:00Z',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    } as Appointment;   

  const handleEdit = () => {
    if (appointment) {
      setEditData({
        date: new Date(appointment.calendar_slot.slot_date),
        startTime: new Date(`${appointment.calendar_slot.slot_date}T${appointment.calendar_slot.start_time}`),
        endTime: new Date(`${appointment.calendar_slot.slot_date}T${appointment.calendar_slot.end_time}`),
        notes: appointment.calendar_slot.notes || '',
        location: appointment.calendar_slot.location || '',
        meetingLink: appointment.calendar_slot.meeting_link || '',
      });
      setEditDialogOpen(true);
    }
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleComplete = () => {
    // Mark appointment as completed
    console.log('Mark appointment as completed');
  };

  const handleSaveFeedback = () => {
    // Save rating and feedback
    console.log('Save feedback:', { rating, feedback });
    setFeedbackDialogOpen(false);
  };

  const handleSaveEdit = () => {
    // Save edited appointment details
    console.log('Save edit:', editData);
    setEditDialogOpen(false);
  };

  const confirmCancel = () => {
    // Cancel appointment
    console.log('Cancel appointment');
    setCancelDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return 'success';
      case APPOINTMENT_STATUS.PENDING:
        return 'warning';
      case APPOINTMENT_STATUS.CANCELLED:
        return 'error';
      case APPOINTMENT_STATUS.COMPLETED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case MEETING_TYPES.ONLINE:
        return <VideoCall />;
      case MEETING_TYPES.PHONE:
        return <Phone />;
      default:
        return <LocationOn />;
    }
  };

  const canEdit = isUniversityStaff || isAdmin;
  const canCancel = appointment?.status === APPOINTMENT_STATUS.CONFIRMED || appointment?.status === APPOINTMENT_STATUS.PENDING;
  const canComplete = (isUniversityStaff || isAdmin) && appointment?.status === APPOINTMENT_STATUS.CONFIRMED;
  const canProvideFeedback = isTalent && appointment?.status === APPOINTMENT_STATUS.COMPLETED && !appointment.rating;

  if (appointmentLoading) {
    return <LoadingSpinner message="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <Box p={3}>
        <Alert severity="error">Appointment not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>
            Appointment Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {appointment.booking_reference}
          </Typography>
        </Box>
        <Chip
          label={appointment.status.toUpperCase()}
          color={getStatusColor(appointment.status) as any}
          variant="filled"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appointment Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Event sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {new Date(appointment.calendar_slot.slot_date).toLocaleDateString()} at{' '}
                      {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  {getMeetingIcon(appointment.calendar_slot.meeting_type)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Meeting Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {appointment.calendar_slot.meeting_type.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {appointment.calendar_slot.location && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {appointment.calendar_slot.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {appointment.calendar_slot.meeting_link && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <VideoCall sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Meeting Link
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        href={appointment.calendar_slot.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Meeting
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Agenda Information */}
            <Typography variant="h6" gutterBottom>
              Agenda Details
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: appointment.calendar_slot.agenda.theme.color_code,
                      mr: 2,
                    }}
                  >
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {appointment.calendar_slot.agenda.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.calendar_slot.agenda.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Chip
                  label={appointment.calendar_slot.agenda.theme.name}
                  size="small"
                  sx={{
                    bgcolor: appointment.calendar_slot.agenda.theme.color_code,
                    color: 'white',
                  }}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            {(appointment.calendar_slot.notes || appointment.talent_notes || appointment.staff_notes) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                
                {appointment.calendar_slot.notes && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Agenda Notes
                    </Typography>
                    <Typography variant="body1">
                      {appointment.calendar_slot.notes}
                    </Typography>
                  </Box>
                )}

                {appointment.talent_notes && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Talent Notes
                    </Typography>
                    <Typography variant="body1">
                      {appointment.talent_notes}
                    </Typography>
                  </Box>
                )}

                {appointment.staff_notes && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Staff Notes
                    </Typography>
                    <Typography variant="body1">
                      {appointment.staff_notes}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Rating and Feedback */}
            {appointment.rating && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Feedback
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Star sx={{ mr: 1, color: 'warning.main' }} />
                  <Rating value={appointment.rating} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({appointment.rating}/5)
                  </Typography>
                </Box>

                {appointment.feedback && (
                  <Typography variant="body1">
                    {appointment.feedback}
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Participants */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Participants
            </Typography>
            
            {/* Talent */}
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {appointment.talent.first_name} {appointment.talent.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Talent
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {appointment.talent.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Staff */}
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2 }}>
                <School />
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {appointment.calendar_slot.staff.first_name} {appointment.calendar_slot.staff.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Career Advisor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {appointment.calendar_slot.staff.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* University */}
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2 }}>
                <School />
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {appointment.calendar_slot.agenda.university.display_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  University
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  fullWidth
                >
                  Edit Appointment
                </Button>
              )}

              {canComplete && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={handleComplete}
                  fullWidth
                >
                  Mark as Completed
                </Button>
              )}

              {canProvideFeedback && (
                <Button
                  variant="contained"
                  startIcon={<Feedback />}
                  onClick={() => setFeedbackDialogOpen(true)}
                  fullWidth
                >
                  Provide Feedback
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  fullWidth
                >
                  Cancel Appointment
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={editData.date}
                onChange={(date) => setEditData({ ...editData, date: date || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="Start Time"
                value={editData.startTime}
                onChange={(time) => setEditData({ ...editData, startTime: time || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="End Time"
                value={editData.endTime}
                onChange={(time) => setEditData({ ...editData, endTime: time || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                value={editData.meetingLink}
                onChange={(e) => setEditData({ ...editData, meetingLink: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              How would you rate this appointment?
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments (Optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience and any suggestions for improvement..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFeedback} variant="contained" disabled={!rating}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

