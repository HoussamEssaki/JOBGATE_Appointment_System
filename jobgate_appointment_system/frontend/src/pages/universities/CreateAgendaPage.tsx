import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';
import type { AppointmentTheme } from '../../types';

const steps = ['Basic Information', 'Schedule Settings', 'Review & Create'];

export const CreateAgendaPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUniversityStaff, isAdmin } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme_id: '',
    slot_duration_minutes: 60,
    max_capacity_per_slot: 1,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    is_recurring: false,
    recurrence_pattern: 'weekly',
    booking_deadline_hours: 24,
    cancellation_deadline_hours: 12,
    is_active: true,
  });

  // Mock themes data
  const themes: AppointmentTheme[] = [
    { id: 1, name: 'Resume Help', color_code: '#2196F3', icon: 'description', is_active: true },
    { id: 2, name: 'Interview Prep', color_code: '#4CAF50', icon: 'record_voice_over', is_active: true },
    { id: 3, name: 'Career Counseling', color_code: '#FF9800', icon: 'psychology', is_active: true },
    { id: 4, name: 'Job Search Strategy', color_code: '#9C27B0', icon: 'work', is_active: true },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const payload = {
          ...formData,
          start_date: formData.start_date.toISOString().split('T')[0],
          end_date: formData.end_date.toISOString().split('T')[0],
          theme: formData.theme_id, // Backend expects theme ID directly
        };
        
        await apiMethods.post('/agendas/', payload);
        
        setSuccess('Agenda created successfully!');
        
        // Redirect to agendas list after a delay
        setTimeout(() => {
          navigate('/universities/agendas');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to create agenda. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name && formData.description && formData.theme_id);
      case 1:
        return !!(formData.slot_duration_minutes > 0 && formData.max_capacity_per_slot > 0);
      default:
        return true;
    }
  };

  const selectedTheme = themes.find(theme => theme.id === parseInt(formData.theme_id));

  if (!isUniversityStaff && !isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">You do not have permission to view this page.</Alert>
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
        <Typography variant="h4">
          Create New Agenda
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Step Content */}
      <Paper sx={{ p: 3 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agenda Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Resume Review Session"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this agenda is about and what participants can expect..."
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={formData.theme_id}
                    onChange={(e) => handleInputChange('theme_id', e.target.value)}
                    label="Theme"
                  >
                    {themes.map((theme) => (
                      <MenuItem key={theme.id} value={theme.id.toString()}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: theme.color_code,
                              mr: 2,
                            }}
                          />
                          {theme.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active (visible to talents)"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Schedule Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Slot Duration (minutes)"
                  value={formData.slot_duration_minutes}
                  onChange={(e) => handleInputChange('slot_duration_minutes', parseInt(e.target.value))}
                  inputProps={{ min: 15, max: 480 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Participants per Slot"
                  value={formData.max_capacity_per_slot}
                  onChange={(e) => handleInputChange('max_capacity_per_slot', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleInputChange('start_date', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleInputChange('end_date', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_recurring}
                      onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                    />
                  }
                  label="Recurring Agenda"
                />
              </Grid>
              
              {formData.is_recurring && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Recurrence Pattern</InputLabel>
                    <Select
                      value={formData.recurrence_pattern}
                      onChange={(e) => handleInputChange('recurrence_pattern', e.target.value)}
                      label="Recurrence Pattern"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Booking Deadline (hours before)"
                  value={formData.booking_deadline_hours}
                  onChange={(e) => handleInputChange('booking_deadline_hours', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 168 }}
                  helperText="How many hours before the appointment can talents book?"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cancellation Deadline (hours before)"
                  value={formData.cancellation_deadline_hours}
                  onChange={(e) => handleInputChange('cancellation_deadline_hours', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 72 }}
                  helperText="How many hours before the appointment can talents cancel?"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Confirm
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formData.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {formData.description}
                </Typography>
                
                {selectedTheme && (
                  <Chip
                    label={selectedTheme.name}
                    sx={{
                      bgcolor: selectedTheme.color_code,
                      color: 'white',
                      mb: 2,
                    }}
                  />
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {formData.slot_duration_minutes} minutes
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Max Capacity: {formData.max_capacity_per_slot} participant(s)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date: {formData.start_date.toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Date: {formData.end_date.toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Recurring: {formData.is_recurring ? `Yes (${formData.recurrence_pattern})` : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status: {formData.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Booking Deadline: {formData.booking_deadline_hours} hours before
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Cancellation Deadline: {formData.cancellation_deadline_hours} hours before
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={!validateStep(activeStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading || !validateStep(activeStep)}
              >
                {loading ? 'Creating...' : 'Create Agenda'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

