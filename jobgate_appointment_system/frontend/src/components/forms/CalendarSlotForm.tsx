
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
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Formik, Form, Field } from 'formik';
import { calendarSlotCreateSchema } from '../../utils/validation';
import  type { CalendarSlotCreateForm as SlotFormData, Agenda } from '../../types';
import { formatDisplayDate, formatTime } from '../../utils/date';

interface CalendarSlotFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SlotFormData) => Promise<void>;
  agendas: Agenda[];
  isLoading?: boolean;
  initialData?: Partial<SlotFormData>;
  mode?: 'create' | 'edit';
}

export const CalendarSlotForm: React.FC<CalendarSlotFormProps> = ({
  open,
  onClose,
  onSubmit,
  agendas,
  isLoading = false,
  initialData,
  mode = 'create',
}) => {
  const handleSubmit = async (values: SlotFormData) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const initialValues: SlotFormData = {
    agenda_id: initialData?.agenda_id || NaN,
    slot_date: initialData?.slot_date || new Date().toISOString().split('T')[0],
    start_time: initialData?.start_time || '09:00',
    end_time: initialData?.end_time || '10:00',
    max_capacity: initialData?.max_capacity || 1,
    meeting_type: initialData?.meeting_type || 'in_person',
    location: initialData?.location || '',
    meeting_link: initialData?.meeting_link || '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    notes: initialData?.notes || '',
    staff_id: 0
  };

  const meetingTypeOptions = [
    { value: 'in_person', label: '🏢 In Person' },
    { value: 'online', label: '💻 Online' },
    { value: 'phone', label: '📞 Phone' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create Calendar Slot' : 'Edit Calendar Slot'}
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={calendarSlotCreateSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, isSubmitting }) => {
          const selectedAgenda = agendas.find(a => a.id === values.agenda_id);
          
          return (
            <Form>
              <DialogContent>
                <Grid container spacing={3}>
                  {/* Agenda Selection */}
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={touched.agenda_id && !!errors.agenda_id}
                    >
                      <InputLabel id="agenda-label">Agenda</InputLabel>
                      <Select
                        labelId="agenda-label"
                        name="agenda_id"
                        value={values.agenda_id || ''}
                        label="Agenda"
                        onChange={(e) => {
                          const agendaId = e.target.value as number;
                          setFieldValue('agenda_id', agendaId);
                          
                          // Auto-fill some values based on selected agenda
                          const agenda = agendas.find(a => a.id === agendaId);
                          if (agenda) {
                            setFieldValue('max_capacity', agenda.max_capacity_per_slot);
                          }
                        }}
                      >
                        <MenuItem value={0}>Select an agenda</MenuItem>
                        {agendas.map((agenda) => (
                          <MenuItem key={agenda.id} value={agenda.id}>
                            {agenda.name}
                            <Box>
                              <Typography variant="body1">{agenda.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {agenda.theme.name} • {agenda.slot_duration_minutes} min
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.agenda_id && errors.agenda_id && (
                        <FormHelperText>{errors.agenda_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Selected Agenda Info */}
                  {selectedAgenda && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Agenda: {selectedAgenda.name}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip 
                            label={selectedAgenda.theme.name} 
                            size="small" 
                            color="primary" 
                          />
                          <Chip 
                            label={`${selectedAgenda.slot_duration_minutes} minutes`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Max ${selectedAgenda.max_capacity_per_slot} people`} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                        {selectedAgenda.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {selectedAgenda.description}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Date and Time */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Date & Time
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label="Date"
                      value={values.slot_date ? new Date(values.slot_date) : null}
                      onChange={(date) => {
                        setFieldValue('slot_date', date ? date.toISOString().split('T')[0] : '');
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.slot_date && !!errors.slot_date,
                          helperText: touched.slot_date && errors.slot_date,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TimePicker
                      label="Start Time"
                      value={values.start_time ? new Date(`2000-01-01T${values.start_time}`) : null}
                      onChange={(time) => {
                        if (time) {
                          const timeString = time.toTimeString().slice(0, 5);
                          setFieldValue('start_time', timeString);
                          
                          // Auto-calculate end time based on agenda duration
                          if (selectedAgenda) {
                            const startMinutes = time.getHours() * 60 + time.getMinutes();
                            const endMinutes = startMinutes + selectedAgenda.slot_duration_minutes;
                            const endHours = Math.floor(endMinutes / 60);
                            const endMins = endMinutes % 60;
                            const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                            setFieldValue('end_time', endTimeString);
                          }
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.start_time && !!errors.start_time,
                          helperText: touched.start_time && errors.start_time,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TimePicker
                      label="End Time"
                      value={values.end_time ? new Date(`2000-01-01T${values.end_time}`) : null}
                      onChange={(time) => {
                        if (time) {
                          const timeString = time.toTimeString().slice(0, 5);
                          setFieldValue('end_time', timeString);
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.end_time && !!errors.end_time,
                          helperText: touched.end_time && errors.end_time,
                        },
                      }}
                    />
                  </Grid>

                  {/* Capacity */}
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      type="number"
                      name="max_capacity"
                      label="Max Capacity"
                      inputProps={{ min: 1, max: 100 }}
                      error={touched.max_capacity && !!errors.max_capacity}
                      helperText={touched.max_capacity && errors.max_capacity}
                    />
                  </Grid>

                  {/* Meeting Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      error={touched.meeting_type && !!errors.meeting_type}
                    >
                      <InputLabel id="meeting-type-label">Meeting Type</InputLabel>
                      <Select
                        labelId="meeting-type-label"
                        name="meeting_type"
                        value={values.meeting_type}
                        label="Meeting Type"
                        onChange={(e) => setFieldValue('meeting_type', e.target.value)}
                      >
                        {meetingTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.meeting_type && errors.meeting_type && (
                        <FormHelperText>{errors.meeting_type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Location (for in-person meetings) */}
                  {values.meeting_type === 'in_person' && (
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="location"
                        label="Location"
                        placeholder="e.g., Room 101, Building A"
                        error={touched.location && !!errors.location}
                        helperText={touched.location && errors.location}
                      />
                    </Grid>
                  )}

                  {/* Meeting Link (for online meetings) */}
                  {values.meeting_type === 'online' && (
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="meeting_link"
                        label="Meeting Link"
                        placeholder="e.g., https://zoom.us/j/123456789"
                        error={touched.meeting_link && !!errors.meeting_link}
                        helperText={touched.meeting_link && errors.meeting_link}
                      />
                    </Grid>
                  )}

                  {/* Notes */}
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      multiline
                      rows={3}
                      name="notes"
                      label="Notes (Optional)"
                      placeholder="Any additional information about this slot..."
                      error={touched.notes && !!errors.notes}
                      helperText={touched.notes && errors.notes}
                    />
                  </Grid>

                  {/* Active Status */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.is_active}
                          onChange={(e) => setFieldValue('is_active', e.target.checked)}
                        />
                      }
                      label="Active (available for booking)"
                    />
                  </Grid>

                  {/* Summary */}
                  {values.slot_date && values.start_time && values.end_time && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Slot Summary
                        </Typography>
                        <Typography variant="body2">
                          📅 {formatDisplayDate(values.slot_date)} at {formatTime(values.start_time)} - {formatTime(values.end_time)}
                        </Typography>
                        <Typography variant="body2">
                          👥 Up to {values.max_capacity} participant(s)
                        </Typography>
                        <Typography variant="body2">
                          {values.meeting_type === 'in_person' && `🏢 ${values.location || 'Location TBD'}`}
                          {values.meeting_type === 'online' && '💻 Online meeting'}
                          {values.meeting_type === 'phone' && '📞 Phone call'}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>

              <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || isLoading || !values.agenda_id}
                >
                  {isSubmitting 
                    ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                    : (mode === 'create' ? 'Create Slot' : 'Update Slot')
                  }
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

