// PreferencesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import type { UserPreferences } from '../../types';

export const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  /* -------------------------------------------------------------- */
  /* STATE                                                          */
  /* -------------------------------------------------------------- */
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* -------------------------------------------------------------- */
  /* MOCK FETCH & UPDATE                                            */
  /* -------------------------------------------------------------- */
  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise(r => setTimeout(r, 500));
      if (!user) return setError('User not authenticated');
      setPreferences({
        id: 1,
        user: user.id,
        email_reminders_enabled: true,
        preferred_meeting_type: 'online',
        cancellation_notice_hours: 24,
        reminder_24h_enabled: true,
        reminder_1h_enabled: true,
        user_timezone: 'UTC',
        language: 'en',
        notification_preferences: {
          email: true,
          sms: false,
          push: false,
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    } catch {
      setError('Failed to fetch preferences.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    if (!preferences) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise(r => setTimeout(r, 500));
      console.log('Updating preferences:', preferences);
      setSuccess('Preferences updated successfully!');
    } catch {
      setError('Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------- */
  /* EVENT HANDLERS                                                 */
  /* -------------------------------------------------------------- */
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleSelect = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setPreferences(prev => prev ? { ...prev, [name]: value } : null);
  };

  /* -------------------------------------------------------------- */
  /* EFFECTS                                                        */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!authLoading && user) fetchPreferences();
  }, [user, authLoading]);

  /* -------------------------------------------------------------- */
  /* RENDER                                                         */
  /* -------------------------------------------------------------- */
  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading preferences...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchPreferences} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  if (!preferences) {
    return (
      <Box p={3}>
        <Alert severity="info">No preferences found. Please log in or try again.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">User Preferences</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.email_reminders_enabled}
                  onChange={handleSwitch}
                  name="email_reminders_enabled"
                />
              }
              label="Enable Email Reminders"
            />
            <Typography variant="body2" color="text.secondary">
              Receive email notifications for upcoming appointments and updates.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.preferred_meeting_type === 'online'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, preferred_meeting_type: e.target.checked ? 'online' : 'in_person' })
                  }
                />
              }
              label="Prefer Online Meetings"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Cancellation Notice (hours)</InputLabel>
              <Select
                name="cancellation_notice_hours"
                value={preferences.cancellation_notice_hours}
                label="Cancellation Notice (hours)"
                onChange={handleSelect}
              >
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
                <MenuItem value={48}>48</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              How much notice you need to cancel an appointment.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={updatePreferences}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};