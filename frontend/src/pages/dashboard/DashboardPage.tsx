
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
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
  const { user, isTalent, isUniversityStaff, isAdmin } = useAuth();

  // Temporarily comment out data fetching
  // const { useAppointmentsList, useAppointmentStatistics } = useAppointments();
  // const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointmentsList({
  //   page: 1,
  // });
  // const { data: statistics, isLoading: statsLoading } = useAppointmentStatistics();

  // Mock data for now
  const appointmentsLoading = false;
  const statsLoading = false;
  const statistics = {
    total_appointments: 25,
    completed_appointments: 18,
    confirmed_appointments: 5,
    unique_talents: 12,
  };

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
                    onClick={() => alert('Book Appointment - Coming Soon')}
                    fullWidth
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    onClick={() => alert('View Calendar - Coming Soon')}
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
                    onClick={() => alert('Create Agenda - Coming Soon')}
                    fullWidth
                  >
                    Create Agenda
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => alert('Manage Slots - Coming Soon')}
                    fullWidth
                  >
                    Manage Slots
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => alert('View Statistics - Coming Soon')}
                    fullWidth
                  >
                    View Statistics
                  </Button>
                </>
              )}

              {isAdmin && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => alert('Manage Users - Coming Soon')}
                    fullWidth
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => alert('Manage Universities - Coming Soon')}
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
            <Typography color="text.secondary">
              No upcoming appointments (Feature coming soon)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

