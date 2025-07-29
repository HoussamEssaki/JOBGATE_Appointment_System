
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Formik, Form, Field } from 'formik';
import { agendaCreateSchema } from '../../utils/validation';
import type { AgendaCreateForm as AgendaFormData, AppointmentTheme } from '../../types';

interface AgendaCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AgendaFormData) => Promise<void>;
  themes: AppointmentTheme[];
  isLoading?: boolean;
  initialData?: Partial<AgendaFormData>;
  mode?: 'create' | 'edit';
}

export const AgendaCreateForm: React.FC<AgendaCreateFormProps> = ({
  open,
  onClose,
  onSubmit,
  themes,
  isLoading = false,
  initialData,
  mode = 'create',
}) => {
  const handleSubmit = async (values: AgendaFormData) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const initialValues: AgendaFormData = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    theme_id: initialData?.theme_id || 0,
    slot_duration_minutes: initialData?.slot_duration_minutes || 30,
    max_capacity_per_slot: initialData?.max_capacity_per_slot || 1,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    booking_deadline_hours: initialData?.booking_deadline_hours || 24,
    cancellation_deadline_hours: initialData?.cancellation_deadline_hours || 24,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create New Agenda' : 'Edit Agenda'}
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={agendaCreateSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="name"
                    label="Agenda Name"
                    placeholder="e.g., Career Counseling Session"
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label="Description"
                    placeholder="Describe what this agenda is about..."
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    error={touched.theme_id && !!errors.theme_id}
                  >
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      name="theme_id"
                      value={values.theme_id}
                      label="Theme"
                      onChange={(e) => setFieldValue('theme_id', e.target.value)}
                    >
                      <MenuItem value={0}>Select a theme</MenuItem>
                      {themes.map((theme) => (
                        <MenuItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.theme_id && errors.theme_id && (
                      <FormHelperText>{errors.theme_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Slot Configuration */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Slot Configuration
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    type="number"
                    name="slot_duration_minutes"
                    label="Slot Duration"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 480 }}
                    error={touched.slot_duration_minutes && !!errors.slot_duration_minutes}
                    helperText={touched.slot_duration_minutes && errors.slot_duration_minutes}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    type="number"
                    name="max_capacity_per_slot"
                    label="Max Capacity per Slot"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">people</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 100 }}
                    error={touched.max_capacity_per_slot && !!errors.max_capacity_per_slot}
                    helperText={touched.max_capacity_per_slot && errors.max_capacity_per_slot}
                  />
                </Grid>

                {/* Date Range */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Date Range
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={values.start_date ? new Date(values.start_date) : null}
                    onChange={(date) => {
                      setFieldValue('start_date', date ? date.toISOString().split('T')[0] : '');
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: touched.start_date && !!errors.start_date,
                        helperText: touched.start_date && errors.start_date,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={values.end_date ? new Date(values.end_date) : null}
                    onChange={(date) => {
                      setFieldValue('end_date', date ? date.toISOString().split('T')[0] : '');
                    }}
                    minDate={values.start_date ? new Date(values.start_date) : undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: touched.end_date && !!errors.end_date,
                        helperText: touched.end_date && errors.end_date,
                      },
                    }}
                  />
                </Grid>

                {/* Booking Rules */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Booking Rules
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    type="number"
                    name="booking_deadline_hours"
                    label="Booking Deadline"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">hours before</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 168 }}
                    error={touched.booking_deadline_hours && !!errors.booking_deadline_hours}
                    helperText={
                      touched.booking_deadline_hours && errors.booking_deadline_hours
                        ? errors.booking_deadline_hours
                        : 'How many hours before the slot should booking close?'
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    type="number"
                    name="cancellation_deadline_hours"
                    label="Cancellation Deadline"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">hours before</InputAdornment>,
                    }}
                    inputProps={{ min: 1, max: 168 }}
                    error={touched.cancellation_deadline_hours && !!errors.cancellation_deadline_hours}
                    helperText={
                      touched.cancellation_deadline_hours && errors.cancellation_deadline_hours
                        ? errors.cancellation_deadline_hours
                        : 'How many hours before the slot should cancellation be allowed?'
                    }
                  />
                </Grid>

                {/* Preview */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Each slot will be {values.slot_duration_minutes} minutes long with a maximum of{' '}
                      {values.max_capacity_per_slot} participant(s). Booking closes{' '}
                      {values.booking_deadline_hours} hours before each slot, and cancellation is allowed up to{' '}
                      {values.cancellation_deadline_hours} hours before.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting 
                  ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                  : (mode === 'create' ? 'Create Agenda' : 'Update Agenda')
                }
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

