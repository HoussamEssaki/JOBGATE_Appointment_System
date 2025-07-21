import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  Event,
  Person,
  LocationOn,
  VideoCall,
  Phone,
  Edit,
  Cancel,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import type { Appointment } from '../../types';
import { formatDisplayDate, formatTime, isAppointmentUpcoming } from '../../utils/date';
import { APPOINTMENT_STATUS } from '../../constants';

interface AppointmentCardProps {
  appointment: Appointment;
  onView?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  showActions?: boolean;
  userRole?: 'talent' | 'university_staff' | 'admin';
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onView,
  onEdit,
  onCancel,
  onConfirm,
  onComplete,
  showActions = true,
  userRole = 'talent',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return 'success';
      case APPOINTMENT_STATUS.PENDING:
        return 'warning';
      case APPOINTMENT_STATUS.CANCELLED:
        return 'error';
      case APPOINTMENT_STATUS.COMPLETED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return <CheckCircle />;
      case APPOINTMENT_STATUS.PENDING:
        return <AccessTime />;
      case APPOINTMENT_STATUS.CANCELLED:
        return <Cancel />;
      case APPOINTMENT_STATUS.COMPLETED:
        return <CheckCircle />;
      default:
        return <Event />;
    }
  };

  const getMeetingIcon = (meetingType: string) => {
    switch (meetingType) {
      case 'online':
        return <VideoCall />;
      case 'phone':
        return <Phone />;
      case 'in_person':
        return <LocationOn />;
      default:
        return <Event />;
    }
  };

  const isUpcoming = isAppointmentUpcoming(
    appointment.calendar_slot.slot_date,
    appointment.calendar_slot.start_time
  );

  const canCancel = appointment.status === APPOINTMENT_STATUS.PENDING || 
                   appointment.status === APPOINTMENT_STATUS.CONFIRMED;
  const canConfirm = appointment.status === APPOINTMENT_STATUS.PENDING && 
                    (userRole === 'university_staff' || userRole === 'admin');
  const canComplete = appointment.status === APPOINTMENT_STATUS.CONFIRMED && 
                     !isUpcoming && 
                     (userRole === 'university_staff' || userRole === 'admin');

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with status and menu */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Chip
            icon={getStatusIcon(appointment.status)}
            label={appointment.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(appointment.status) as any}
            size="small"
          />
          
          {showActions && (
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Agenda Information */}
        <Typography variant="h6" gutterBottom>
          {appointment.calendar_slot.agenda.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {appointment.calendar_slot.agenda.description}
        </Typography>

        {/* Date and Time */}
        <Box display="flex" alignItems="center" mb={1}>
          <Event sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDisplayDate(appointment.calendar_slot.slot_date)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <AccessTime sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatTime(appointment.calendar_slot.start_time)} - {formatTime(appointment.calendar_slot.end_time)}
          </Typography>
        </Box>

        {/* Meeting Type and Location */}
        <Box display="flex" alignItems="center" mb={2}>
          {getMeetingIcon(appointment.calendar_slot.meeting_type)}
          <Typography variant="body2" sx={{ ml: 1 }}>
            {appointment.calendar_slot.meeting_type === 'in_person' && 
              (appointment.calendar_slot.location || 'Location TBD')}
            {appointment.calendar_slot.meeting_type === 'online' && 'Online Meeting'}
            {appointment.calendar_slot.meeting_type === 'phone' && 'Phone Call'}
          </Typography>
        </Box>

        {/* Participants */}
        <Box display="flex" alignItems="center" mb={1}>
          <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          <Box>
            {userRole === 'talent' ? (
              <Typography variant="body2">
                with {appointment.calendar_slot.staff?.first_name} {appointment.calendar_slot.staff?.last_name}
              </Typography>
            ) : (
              <Typography variant="body2">
                {appointment.talent.first_name} {appointment.talent.last_name}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {appointment.talent.email}
            </Typography>
          </Box>
        </Box>

        {/* Theme */}
        <Box mt={2}>
          <Chip
            label={appointment.calendar_slot.agenda.theme.name}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>

        {/* Notes */}
        {appointment.talent_notes && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Notes:
            </Typography>
            <Typography variant="body2">
              {appointment.talent_notes}
            </Typography>
          </Box>
        )}

        {/* Upcoming indicator */}
        {isUpcoming && appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
          <Box mt={2}>
            <Chip
              label="Upcoming"
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions>
        <Button size="small" onClick={() => onView?.(appointment)}>
          View Details
        </Button>
        
        {appointment.calendar_slot.meeting_type === 'online' && 
         appointment.calendar_slot.meeting_link && 
         appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
          <Button 
            size="small" 
            color="primary"
            href={appointment.calendar_slot.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Meeting
          </Button>
        )}
      </CardActions>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { onView?.(appointment); handleMenuClose(); }}>
          <Event sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {onEdit && (userRole === 'university_staff' || userRole === 'admin') && (
          <MenuItem onClick={() => { onEdit(appointment); handleMenuClose(); }}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        
        <Divider />
        
        {canConfirm && onConfirm && (
          <MenuItem onClick={() => { onConfirm(appointment); handleMenuClose(); }}>
            <CheckCircle sx={{ mr: 1 }} />
            Confirm
          </MenuItem>
        )}
        
        {canComplete && onComplete && (
          <MenuItem onClick={() => { onComplete(appointment); handleMenuClose(); }}>
            <CheckCircle sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        
        {canCancel && onCancel && (
          <MenuItem 
            onClick={() => { onCancel(appointment); handleMenuClose(); }}
            sx={{ color: 'error.main' }}
          >
            <Cancel sx={{ mr: 1 }} />
            Cancel
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

