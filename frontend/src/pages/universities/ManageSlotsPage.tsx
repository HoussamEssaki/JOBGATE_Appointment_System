/* ManageSlotsPage.tsx – fully fixed & type-safe */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  Event,
  Block,
  CheckCircle,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* 1. Minimal, complete types                                         */
/* ------------------------------------------------------------------ */
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  user_type: 'admin' | 'staff' | 'student' | 'talent';
  is_active: boolean;
  date_joined: string;
}

interface UniversityProfile {
  id: number;
  display_name: string;
  base_user: User;          // ← required, no longer undefined
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface AppointmentTheme {
  id: number;
  name: string;
  color_code: string;
  icon: string;
  is_active: boolean;
}

interface RecurrencePattern {
  type: 'weekly' | 'bi-weekly' | 'monthly';
}

interface Agenda {
  id: number;
  name: string;
  description?: string;
  theme: AppointmentTheme;
  slot_duration_minutes: number;
  max_capacity_per_slot: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  booking_deadline_hours: number;
  cancellation_deadline_hours: number;
  is_active: boolean;
  university: UniversityProfile;
  created_by: User;
  created_at: string;
  updated_at: string;
}

interface CalendarSlot {
  id: number;
  agenda: Agenda;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  status: 'available' | 'fully_booked' | 'cancelled' | 'blocked';
  location: string;
  meeting_type: 'in_person' | 'online' | 'phone';
  meeting_link: string;
  notes?: string;
  staff: User;
  created_at: string;
  updated_at: string;
  available_capacity: number;
  is_active: boolean;
}

/* ------------------------------------------------------------------ */
/* 2. Dummy user so base_user is never undefined                      */
/* ------------------------------------------------------------------ */
const dummyUser: User = {
  id: 0,
  first_name: 'System',
  last_name: 'User',
  email: 'system@placeholder.edu',
  username: 'system',
  user_type: 'admin',
  is_active: true,
  date_joined: new Date().toISOString(),
};

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */
export const ManageSlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUniversityStaff, isAdmin } = useAuth();

  /* -------------------- State -------------------- */
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Filters */
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgenda, setSelectedAgenda] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* Pagination */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* Dialog & Menu */
  const [addSlotDialogOpen, setAddSlotDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /* New slot form */
  const [newSlot, setNewSlot] = useState({
    agenda_id: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    meetingType: 'in_person' as 'in_person' | 'online' | 'phone',
    meetingLink: '',
    notes: '',
    maxCapacity: 1,
  });

  /* ------------------------------------------------------------------ */
  /* Mock API calls                                                      */
  /* ------------------------------------------------------------------ */
  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 500));

      const mockAgendas: Agenda[] = [
        {
          id: 1,
          name: 'Resume Review Session',
          description: 'One-on-one resume review and feedback',
          theme: {
            id: 1,
            name: 'Resume Help',
            color_code: '#2196F3',
            icon: 'description',
            is_active: true,
          },
          slot_duration_minutes: 60,
          max_capacity_per_slot: 1,
          start_date: '2024-01-15',
          end_date: '2024-03-15',
          is_recurring: true,
          recurrence_pattern: { type: 'weekly' },
          booking_deadline_hours: 24,
          cancellation_deadline_hours: 12,
          is_active: true,
          university: {
            id: 1,
            display_name: 'University Career Center',
            base_user: dummyUser,
            created_by: 0,
            created_at: '',
            updated_at: '',
          },
          created_by: {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@university.edu',
            username: '',
            user_type: 'admin',
            is_active: true,
            date_joined: '',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSlots: CalendarSlot[] = [
        {
          id: 1,
          agenda: mockAgendas[0],
          slot_date: '2024-01-22',
          start_time: '10:00',
          end_time: '11:00',
          max_capacity: 1,
          current_bookings: 1,
          status: 'fully_booked',
          location: 'Career Center Room 101',
          meeting_type: 'in_person',
          meeting_link: '',
          notes: 'Please bring your current resume',
          staff: {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@university.edu',
            username: '',
            user_type: 'admin',
            is_active: true,
            date_joined: '',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          available_capacity: 0,
          is_active: true,
        },
        {
          id: 2,
          agenda: mockAgendas[0],
          slot_date: '2024-01-23',
          start_time: '14:00',
          end_time: '15:00',
          max_capacity: 1,
          current_bookings: 0,
          status: 'available',
          location: '',
          meeting_type: 'online',
          meeting_link: 'https://zoom.us/j/123456789',
          notes: 'Online session via Zoom',
          staff: {
            id: 3,
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob.johnson@university.edu',
            username: '',
            user_type: 'admin',
            is_active: true,
            date_joined: '',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          available_capacity: 0,
          is_active: true,
        },
        {
          id: 3,
          agenda: mockAgendas[0],
          slot_date: '2024-01-24',
          start_time: '09:00',
          end_time: '10:00',
          max_capacity: 1,
          current_bookings: 0,
          status: 'blocked',
          location: 'Career Center Room 102',
          meeting_type: 'in_person',
          meeting_link: '',
          notes: 'Staff unavailable',
          staff: {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@university.edu',
            username: '',
            user_type: 'admin',
            is_active: true,
            date_joined: '',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          available_capacity: 0,
          is_active: true,
        },
      ];

      setAgendas(mockAgendas);
      setSlots(mockSlots);
    } catch (err) {
      setError('Failed to fetch slots.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  /* -------------------- Handlers -------------------- */
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, slot: CalendarSlot) => {
    setAnchorEl(e.currentTarget);
    setSelectedSlot(slot);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSlot(null);
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedSlot) console.log(`Change ${selectedSlot.id} to ${newStatus}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const confirmDelete = () => {
    if (selectedSlot) console.log(`Delete ${selectedSlot.id}`);
    setDeleteDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleAddSlot = async () => {
    console.log('Add slot:', newSlot);
    setAddSlotDialogOpen(false);
    fetchSlots();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'fully_booked': return 'error';
      case 'cancelled': return 'default';
      case 'blocked': return 'warning';
      default: return 'default';
    }
  };

  /* -------------------- Filtering & Pagination -------------------- */
  const filteredSlots = slots.filter(slot => {
    const s = searchTerm.toLowerCase();
    return (
      (!s ||
        slot.agenda.name.toLowerCase().includes(s) ||
        `${slot.staff.first_name} ${slot.staff.last_name}`.toLowerCase().includes(s)) &&
      (!selectedAgenda || slot.agenda.id === Number(selectedAgenda)) &&
      (!selectedStatus || slot.status === selectedStatus) &&
      (!selectedDate || new Date(slot.slot_date).toDateString() === selectedDate.toDateString())
    );
  });

  const paginatedSlots = filteredSlots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* -------------------- Guards -------------------- */
  if (!isUniversityStaff && !isAdmin)
    return (
      <Box p={3}>
        <Alert severity="warning">You do not have permission to view this page.</Alert>
      </Box>
    );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading slots...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchSlots} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <Event sx={{ mr: 1, verticalAlign: 'middle' }} /> Manage Time Slots
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddSlotDialogOpen(true)}>
          Add Time Slot
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filter Slots</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search slots..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Agenda</InputLabel>
              <Select
                value={selectedAgenda}
                onChange={e => setSelectedAgenda(e.target.value)}
                label="Agenda"
              >
                <MenuItem value="">All Agendas</MenuItem>
                {agendas.map(a => (
                  <MenuItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="fully_booked">Fully Booked</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={setSelectedDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedAgenda('');
                setSelectedStatus('');
                setSelectedDate(null);
              }}
              sx={{ height: 56 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Slots Table */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Agenda</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Location/Type</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSlots.length ? (
                paginatedSlots.map(slot => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <Typography variant="body2">{new Date(slot.slot_date).toLocaleDateString()}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {slot.start_time} - {slot.end_time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{slot.agenda.name}</Typography>
                      <Chip
                        label={slot.agenda.theme.name}
                        size="small"
                        sx={{ bgcolor: slot.agenda.theme.color_code, color: 'white', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {slot.staff.first_name} {slot.staff.last_name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {slot.meeting_type.replace('_', ' ')}
                      </Typography>
                      {slot.location && (
                        <Typography variant="body2" color="text.secondary">
                          {slot.location}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {slot.current_bookings}/{slot.max_capacity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={slot.status.replace('_', ' ')}
                        color={getStatusColor(slot.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, slot)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No slots found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSlots.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => navigate(`/universities/slots/${selectedSlot?.id}`)}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/universities/slots/${selectedSlot?.id}/edit`)}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {selectedSlot?.status !== 'blocked' && (
          <MenuItem onClick={() => handleStatusChange('blocked')}>
            <ListItemIcon><Block fontSize="small" /></ListItemIcon>
            <ListItemText>Block Slot</ListItemText>
          </MenuItem>
        )}
        {selectedSlot?.status === 'blocked' && (
          <MenuItem onClick={() => handleStatusChange('available')}>
            <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
            <ListItemText>Unblock Slot</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleStatusChange('cancelled')}>
          <ListItemIcon><Cancel fontSize="small" /></ListItemIcon>
          <ListItemText>Cancel Slot</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Slot Dialog */}
      <Dialog open={addSlotDialogOpen} onClose={() => setAddSlotDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Time Slot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Agenda</InputLabel>
                <Select
                  value={newSlot.agenda_id}
                  onChange={e => setNewSlot({ ...newSlot, agenda_id: e.target.value })}
                  label="Agenda"
                >
                  {agendas.map(a => (
                    <MenuItem key={a.id} value={a.id.toString()}>
                      {a.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={newSlot.date}
                onChange={d => setNewSlot({ ...newSlot, date: d || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="Start Time"
                value={newSlot.startTime}
                onChange={t => setNewSlot({ ...newSlot, startTime: t || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TimePicker
                label="End Time"
                value={newSlot.endTime}
                onChange={t => setNewSlot({ ...newSlot, endTime: t || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Meeting Type</InputLabel>
                <Select
                  value={newSlot.meetingType}
                  onChange={e => setNewSlot({ ...newSlot, meetingType: e.target.value as any })}
                  label="Meeting Type"
                >
                  <MenuItem value="in_person">In Person</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Capacity"
                value={newSlot.maxCapacity}
                onChange={e => setNewSlot({ ...newSlot, maxCapacity: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newSlot.location}
                onChange={e => setNewSlot({ ...newSlot, location: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                value={newSlot.meetingLink}
                onChange={e => setNewSlot({ ...newSlot, meetingLink: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={newSlot.notes}
                onChange={e => setNewSlot({ ...newSlot, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSlotDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSlot} variant="contained">Add Slot</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Slot Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Time Slot</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this time slot? This action cannot be undone.
            {selectedSlot?.current_bookings && selectedSlot.current_bookings > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This slot has {selectedSlot.current_bookings} booking(s). Deleting it will cancel these appointments.
              </Alert>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Slot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};