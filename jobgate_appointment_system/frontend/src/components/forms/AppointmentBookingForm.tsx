import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormHelperText,
  Grid,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { appointmentBookingSchema } from '../../utils/validation';
import { formatDisplayDate, formatTime } from '../../utils/date';
import type { CalendarSlot, AppointmentBookingForm as BookingFormData } from '../../types';

interface AppointmentBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  availableSlots: CalendarSlot[];
  isLoading?: boolean;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
  open,
  onClose,
  onSubmit,
  availableSlots,
  isLoading = false,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);

  const handleSubmit = async (values: BookingFormData) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (_error) {
      // Error handling is done in the parent component
    }
  };

  const getSlotStatusColor = (slot: CalendarSlot) => {
    const availableCapacity = slot.max_capacity - slot.current_bookings;
    if (availableCapacity === 0) return 'error';
    if (availableCapacity <= 2) return 'warning';
    return 'success';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book Appointment</DialogTitle>
      
      <Formik
        initialValues={{
          calendar_slot_id: selectedSlot?.id || 0,
          talent_notes: '',
        }}
        validationSchema={appointmentBookingSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Available Slots Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Available Time Slot
                  </Typography>
                  
                  {availableSlots.length === 0 ? (
                    <Alert severity="info">
                      No available slots found. Please try a different date range.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {availableSlots.map((slot) => {
                        const availableCapacity = slot.max_capacity - slot.current_bookings;
                        const isSelected = selectedSlot?.id === slot.id;
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={slot.id}>
                            <Card
                              sx={{
                                cursor: availableCapacity > 0 ? 'pointer' : 'not-allowed',
                                border: isSelected ? 2 : 1,
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                opacity: availableCapacity === 0 ? 0.5 : 1,
                                '&:hover': {
                                  borderColor: availableCapacity > 0 ? 'primary.main' : 'divider',
                                },
                              }}
                              onClick={() => {
                                if (availableCapacity > 0) {
                                  setSelectedSlot(slot);
                                  setFieldValue('calendar_slot_id', slot.id);
                                }
                              }}
                            >
                              <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                  {slot.agenda.name}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary">
                                  {formatDisplayDate(slot.slot_date)}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </Typography>
                                
                                <Box mt={1} display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label={`${availableCapacity} spots left`}
                                    size="small"
                                    color={getSlotStatusColor(slot)}
                                  />
                                  
                                  <Chip
                                    label={slot.meeting_type}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                                
                                {slot.staff && (
                                  <Typography variant="caption" display="block" mt={1}>
                                    with {slot.staff.first_name} {slot.staff.last_name}
                                  </Typography>
                                )}
                                
                                {slot.location && (
                                  <Typography variant="caption" display="block">
                                    📍 {slot.location}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                  
                  {touched.calendar_slot_id && errors.calendar_slot_id && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {errors.calendar_slot_id}
                    </FormHelperText>
                  )}
                </Grid>

                {/* Selected Slot Details */}
                {selectedSlot && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="subtitle2">Selected Slot:</Typography>
                      <Typography variant="body2">
                        {selectedSlot.agenda.name} on {formatDisplayDate(selectedSlot.slot_date)} 
                        at {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                      </Typography>
                      {selectedSlot.agenda.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {selectedSlot.agenda.description}
                        </Typography>
                      )}
                    </Alert>
                  </Grid>
                )}

                {/* Notes */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={4}
                    name="talent_notes"
                    label="Notes (Optional)"
                    placeholder="Any specific topics you'd like to discuss or questions you have..."
                    error={touched.talent_notes && !!errors.talent_notes}
                    helperText={touched.talent_notes && errors.talent_notes}
                  />
                </Grid>

                {/* Meeting Details */}
                {selectedSlot && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Meeting Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Meeting Type
                        </Typography>
                        <Typography variant="body1">
                          {selectedSlot.meeting_type === 'in_person' && '🏢 In Person'}
                          {selectedSlot.meeting_type === 'online' && '💻 Online'}
                          {selectedSlot.meeting_type === 'phone' && '📞 Phone'}
                        </Typography>
                      </Grid>
                      
                      {selectedSlot.meeting_type === 'online' && selectedSlot.meeting_link && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Meeting Link
                          </Typography>
                          <Typography variant="body1">
                            Will be provided after booking
                          </Typography>
                        </Grid>
                      )}
                      
                      {selectedSlot.location && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1">
                            {selectedSlot.location}
                          </Typography>
                        </Grid>
                      )}
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {selectedSlot.agenda.slot_duration_minutes} minutes
                        </Typography>
                      </Grid>
                    </Grid>
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
                disabled={isSubmitting || !selectedSlot || isLoading}
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

