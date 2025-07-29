import React from 'react';
import { apiMethods } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  ListItem,
  ListItemText,
  List,
} from '@mui/material';
import {
  Event,
  Schedule,
  CheckCircle,
  TrendingUp,
  CalendarToday,
  School,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
// import { useAppointments } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
// import { ROUTES, APPOINTMENT_STATUS } from '../../constants';
// import { formatDisplayDate, formatTime, isAppointmentUpcoming } from '../../utils/date';

export const DashboardPage: React.FC = () => {
  //const navigate = useNavigate();

  // Temporarily comment out data fetching
  // const { useAppointmentsList, useAppointmentStatistics } = useAppointments();
  // const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointmentsList({
  //   page: 1,
  // });
  // const { data: statistics, isLoading: statsLoading } = useAppointmentStatistics();
   interface AppointmentStatistics {
      total_appointments: number;
      completed_appointments: number;
      confirmed_appointments: number;
      unique_talents: number;
    }

    const navigate = useNavigate();
    const { user, isTalent, isUniversityStaff, isAdmin } = useAuth();

    const { data: statistics, isLoading: statsLoading } = useQuery<AppointmentStatistics>({
      queryKey: ["appointmentStatistics"],
      queryFn: async () => apiMethods.get("/appointments/statistics/"),
      enabled: isAdmin || isUniversityStaff, // Only fetch if admin or university staff
    });

    const { data: upcomingAppointments = [], isLoading: upcomingAppointmentsLoading } = useQuery<any[]>({
      queryKey: ["upcomingAppointments"],
      queryFn: async () => apiMethods.get("/appointments/upcoming/"),
      enabled: isTalent, // Only fetch if talent
    });

    if (statsLoading || upcomingAppointmentsLoading) {
      return <LoadingSpinner message="Loading dashboard..." />;
    }

  // Mock data for now
  const appointmentsLoading = false;


  if (appointmentsLoading || statsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.first_name}!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {isTalent && "Here's an overview of your appointments and upcoming events."}
        {isUniversityStaff && "Manage your university's appointments and view analytics."}
        {isAdmin && "System overview and administrative controls."}
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {statistics && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Event />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Appointments
                      </Typography>
                      <Typography variant="h5">
                        {statistics.total_appointments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h5">
                        {statistics.completed_appointments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Confirmed
                      </Typography>
                      <Typography variant="h5">
                        {statistics.confirmed_appointments}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Unique Talents
                      </Typography>
                      <Typography variant="h5">
                        {statistics.unique_talents}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              {isTalent && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Event />}
                    onClick={() => navigate("/appointments/book")}
                    fullWidth
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    onClick={() => navigate("/calendar")}
                    fullWidth
                  >
                    View Calendar
                  </Button>
                </>
              )}

              {isUniversityStaff && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<School />}
                    onClick={() => navigate("/universities/agendas/create")}
                    fullWidth
                  >
                    Create Agenda
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => navigate("/universities/slots")}
                    fullWidth
                  >
                    Manage Slots
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate("/admin/statistics")}
                    fullWidth
                  >
                    View Statistics
                  </Button>
                </>
              )}

              {(isAdmin || isUniversityStaff) && statistics && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => navigate("/admin/users")}
                    fullWidth
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => navigate("/admin/universities")}
                    fullWidth
                  >
                    Manage Universities
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Appointments Placeholder */}
        <Grid item xs={12} md={6}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Appointments
        </Typography>
        {isTalent && upcomingAppointments.length > 0 ? (
          <List>
            {upcomingAppointments.map((appointment: any) => (
              <ListItem key={appointment.id} divider>
                <ListItemText
                  primary={`${appointment.calendar_slot.agenda.name} with ${appointment.calendar_slot.staff.first_name} ${appointment.calendar_slot.staff.last_name}`}
                  secondary={`${new Date(appointment.calendar_slot.slot_date).toLocaleDateString()} at ${appointment.calendar_slot.start_time}`}
                />
                <Button size="small" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                  View
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            {isTalent ? "You have no upcoming appointments." : "No upcoming appointments to display."}
          </Typography>
        )}
      </Paper>
    </Grid>
      </Grid>
    </Box>
  );
};

