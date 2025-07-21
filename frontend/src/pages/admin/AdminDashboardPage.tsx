import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert, Button } from '@mui/material';
import { People, School, Event, BarChart } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUniversities: 0,
    totalAgendas: 0,
    totalAppointments: 0,
  });

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        totalUsers: 150,
        totalUniversities: 15,
        totalAgendas: 75,
        totalAppointments: 500,
      });
    } catch (err) {
      setError('Failed to fetch dashboard statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchDashboardStats} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom mb={3}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Users</Typography>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Universities</Typography>
                  <Typography variant="h4">{stats.totalUniversities}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Event color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Agendas</Typography>
                  <Typography variant="h4">{stats.totalAgendas}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BarChart color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Appointments</Typography>
                  <Typography variant="h4">{stats.totalAppointments}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This dashboard provides a high-level overview of the JOBGATE Appointment System.
          Detailed management and statistics are available through the navigation menu.
        </Typography>
      </Paper>
    </Box>
  );
};

