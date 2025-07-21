import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Event,
  Assessment,
  CalendarToday,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface SystemStats {
  totalUsers: number;
  totalUniversities: number;
  totalAgendas: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  activeUsers: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
}

interface AppointmentTrend {
  month: string;
  appointments: number;
  completed: number;
  cancelled: number;
}

export const SystemStatisticsPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('last_6_months');
  
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalUniversities: 0,
    totalAgendas: 0,
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    appointmentsLastMonth: 0,
    activeUsers: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
  });

  const [trends, setTrends] = useState<AppointmentTrend[]>([]);

  // Mock API call to fetch statistics
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockStats: SystemStats = {
        totalUsers: 1247,
        totalUniversities: 15,
        totalAgendas: 89,
        totalAppointments: 3456,
        appointmentsThisMonth: 234,
        appointmentsLastMonth: 198,
        activeUsers: 1089,
        completedAppointments: 2987,
        cancelledAppointments: 234,
        pendingAppointments: 235,
      };

      const mockTrends: AppointmentTrend[] = [
        { month: 'Jan 2024', appointments: 145, completed: 132, cancelled: 13 },
        { month: 'Feb 2024', appointments: 167, completed: 151, cancelled: 16 },
        { month: 'Mar 2024', appointments: 189, completed: 172, cancelled: 17 },
        { month: 'Apr 2024', appointments: 203, completed: 185, cancelled: 18 },
        { month: 'May 2024', appointments: 198, completed: 179, cancelled: 19 },
        { month: 'Jun 2024', appointments: 234, completed: 210, cancelled: 24 },
      ];

      setStats(mockStats);
      setTrends(mockTrends);
    } catch (err) {
      setError('Failed to fetch statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStatistics();
    }
  }, [isAdmin, timeRange]);

  const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const growthRate = calculateGrowthRate(stats.appointmentsThisMonth, stats.appointmentsLastMonth);

  if (!isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">You do not have permission to view this page.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading statistics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchStatistics} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} /> System Statistics
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="last_30_days">Last 30 Days</MenuItem>
            <MenuItem value="last_3_months">Last 3 Months</MenuItem>
            <MenuItem value="last_6_months">Last 6 Months</MenuItem>
            <MenuItem value="last_year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.activeUsers} active
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Universities
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {stats.totalUniversities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active institutions
                  </Typography>
                </Box>
                <School color="secondary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Agendas
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.totalAgendas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available services
                  </Typography>
                </Box>
                <Event color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Appointments
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.totalAppointments.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TrendingUp 
                      color={growthRate >= 0 ? "success" : "error"} 
                      sx={{ fontSize: 16, mr: 0.5 }} 
                    />
                    <Typography 
                      variant="body2" 
                      color={growthRate >= 0 ? "success.main" : "error.main"}
                    >
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <CalendarToday color="warning" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Appointment Status Breakdown */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {stats.completedAppointments.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)}% of total
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {stats.pendingAppointments.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((stats.pendingAppointments / stats.totalAppointments) * 100).toFixed(1)}% of total
                  </Typography>
                </Box>
                <Schedule color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Cancelled
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {stats.cancelledAppointments.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1)}% of total
                  </Typography>
                </Box>
                <Cancel color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Trends */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Appointment Trends
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Total Appointments</TableCell>
                <TableCell align="right">Completed</TableCell>
                <TableCell align="right">Cancelled</TableCell>
                <TableCell align="right">Completion Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trends.map((trend) => {
                const completionRate = (trend.completed / trend.appointments) * 100;
                return (
                  <TableRow key={trend.month}>
                    <TableCell>{trend.month}</TableCell>
                    <TableCell align="right">{trend.appointments}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={trend.completed} 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={trend.cancelled} 
                        color="error" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${completionRate.toFixed(1)}%`}
                        color={completionRate >= 85 ? "success" : completionRate >= 70 ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Key Metrics Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Performance Indicators
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>User Engagement Rate</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of users are active
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>Average Appointments per University</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(stats.totalAppointments / stats.totalUniversities).toFixed(0)} appointments per institution
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>Monthly Growth Rate</strong>
              </Typography>
              <Typography 
                variant="body2" 
                color={growthRate >= 0 ? "success.main" : "error.main"}
              >
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% compared to last month
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>Overall Success Rate</strong>
              </Typography>
              <Typography variant="body2" color="success.main">
                {((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)}% of appointments completed successfully
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

