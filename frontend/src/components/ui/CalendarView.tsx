import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import type { CalendarSlot, Appointment } from '../../types';
import { formatTime } from '../../utils/date';

interface CalendarViewProps {
  slots: CalendarSlot[];
  appointments?: Appointment[];
  onSlotClick?: (slot: CalendarSlot) => void;
  onDateClick?: (date: Date) => void;
  onCreateSlot?: (date: Date) => void;
  showCreateButton?: boolean;
  userRole?: 'talent' | 'university_staff' | 'admin';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  slots,
  appointments = [],
  onSlotClick,
  onDateClick,
  onCreateSlot,
  showCreateButton = false,
  userRole = 'talent',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return slots.filter(slot => slot.slot_date === dateString);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => 
      appointment.calendar_slot.slot_date === dateString
    );
  };

  const getSlotStatusColor = (slot: CalendarSlot) => {
    const availableCapacity = slot.max_capacity - slot.current_bookings;
    if (!slot.is_active) return 'default';
    if (availableCapacity === 0) return 'error';
    if (availableCapacity <= 2) return 'warning';
    return 'success';
  };

  const renderCalendarDay = (date: Date) => {
    const daySlots = getSlotsForDate(date);
    const dayAppointments = getAppointmentsForDate(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isCurrentDay = isSameDay(date, new Date());
    //const hasEvents = daySlots.length > 0 || dayAppointments.length > 0;

    return (
      <Card
        key={date.toISOString()}
        sx={{
          minHeight: isMobile ? 80 : 120,
          cursor: 'pointer',
          opacity: isCurrentMonth ? 1 : 0.3,
          border: isCurrentDay ? 2 : 1,
          borderColor: isCurrentDay ? 'primary.main' : 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 1,
          },
        }}
        onClick={() => onDateClick?.(date)}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          {/* Date number */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              fontWeight={isCurrentDay ? 'bold' : 'normal'}
              color={isCurrentDay ? 'primary.main' : 'text.primary'}
            >
              {format(date, 'd')}
            </Typography>
            
            {showCreateButton && isCurrentMonth && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSlot?.(date);
                }}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <Add fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Events */}
          <Box>
            {/* Slots */}
            {daySlots.slice(0, isMobile ? 2 : 3).map((slot) => (
              <Tooltip
                key={slot.id}
                title={`${slot.agenda.name} - ${formatTime(slot.start_time)} to ${formatTime(slot.end_time)}`}
              >
                <Chip
                  label={isMobile ? formatTime(slot.start_time) : `${formatTime(slot.start_time)} ${slot.agenda.name}`}
                  size="small"
                  color={getSlotStatusColor(slot)}
                  sx={{
                    mb: 0.5,
                    mr: 0.5,
                    fontSize: '0.7rem',
                    height: 20,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick?.(slot);
                  }}
                />
              </Tooltip>
            ))}

            {/* Appointments (for talents) */}
            {userRole === 'talent' && dayAppointments.slice(0, isMobile ? 1 : 2).map((appointment) => (
              <Tooltip
                key={appointment.id}
                title={`${appointment.calendar_slot.agenda.name} - ${appointment.status}`}
              >
                <Chip
                  label={isMobile ? formatTime(appointment.calendar_slot.start_time) : appointment.calendar_slot.agenda.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    mb: 0.5,
                    mr: 0.5,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Tooltip>
            ))}

            {/* Show more indicator */}
            {(daySlots.length + dayAppointments.length) > (isMobile ? 2 : 3) && (
              <Typography variant="caption" color="text.secondary">
                +{(daySlots.length + dayAppointments.length) - (isMobile ? 2 : 3)} more
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>
          
          <Typography variant="h5" sx={{ minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Today />}
          onClick={handleToday}
          size="small"
        >
          Today
        </Button>
      </Box>

      {/* Days of week header */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              color="text.secondary"
              sx={{ py: 1 }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {calendarDays.map((date) => (
          <Grid item xs key={date.toISOString()}>
            {renderCalendarDay(date)}
          </Grid>
        ))}
      </Grid>

      {/* Legend */}
      <Box mt={3} display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip size="small" color="success" label="" sx={{ width: 16, height: 16 }} />
          <Typography variant="caption">Available</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip size="small" color="warning" label="" sx={{ width: 16, height: 16 }} />
          <Typography variant="caption">Limited</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip size="small" color="error" label="" sx={{ width: 16, height: 16 }} />
          <Typography variant="caption">Full</Typography>
        </Box>
        {userRole === 'talent' && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Chip size="small" color="primary" variant="outlined" label="" sx={{ width: 16, height: 16 }} />
            <Typography variant="caption">Your Appointments</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

