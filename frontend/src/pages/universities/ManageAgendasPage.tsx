import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
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
  AccessTime,
  Person,
  Visibility,
  FileCopy,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* 1. Minimal Types (only what the page needs)                         */
/* ------------------------------------------------------------------ */
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  user_type: 'student' | 'staff' | 'admin';
  is_active: boolean;
  date_joined: string;
}

interface UniversityProfile {
  id: number;
  display_name: string;
  base_user: User;          // ← required by your schema
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

/* ------------------------------------------------------------------ */
/* 2. Dummy logged-in user (needed for UniversityProfile.base_user)   */
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

/* ------------------------------------------------------------------ */
/* 3. Component                                                       */
/* ------------------------------------------------------------------ */
export const ManageAgendasPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUniversityStaff, isAdmin } = useAuth();

  /* -------------------- State -------------------- */
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);

  /* -------------------- Mock Themes -------------------- */
  const themes: AppointmentTheme[] = [
    { id: 1, name: 'Resume Help', color_code: '#2196F3', icon: 'description', is_active: true },
    { id: 2, name: 'Interview Prep', color_code: '#4CAF50', icon: 'record_voice_over', is_active: true },
    { id: 3, name: 'Career Counseling', color_code: '#FF9800', icon: 'psychology', is_active: true },
    { id: 4, name: 'Job Search Strategy', color_code: '#9C27B0', icon: 'work', is_active: true },
  ];

  /* -------------------- Mock API -------------------- */
  const fetchAgendas = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 500));

      const mockAgendas: Agenda[] = [
        {
          id: 1,
          name: 'Resume Review Session',
          description: 'One-on-one resume review and feedback with career advisors',
          theme: themes[0],
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
        {
          id: 2,
          name: 'Interview Preparation Workshop',
          description: 'Practice interviews and receive feedback on your performance',
          theme: themes[1],
          slot_duration_minutes: 90,
          max_capacity_per_slot: 3,
          start_date: '2024-01-20',
          end_date: '2024-04-20',
          is_recurring: true,
          recurrence_pattern: { type: 'bi-weekly' },
          booking_deadline_hours: 48,
          cancellation_deadline_hours: 24,
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
        {
          id: 3,
          name: 'Career Counseling Sessions',
          description: 'Personalized career guidance and planning sessions',
          theme: themes[2],
          slot_duration_minutes: 45,
          max_capacity_per_slot: 1,
          start_date: '2024-02-01',
          end_date: '2024-05-01',
          is_recurring: true,
          recurrence_pattern: { type: 'weekly' },
          booking_deadline_hours: 12,
          cancellation_deadline_hours: 6,
          is_active: false,
          university: {
            id: 1,
            display_name: 'University Career Center',
            base_user: dummyUser,
            created_by: 0,
            created_at: '',
            updated_at: '',
          },
          created_by: {
            id: 3,
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob.johnson@university.edu',
            username: '',
            user_type: 'admin',
            is_active: true,
            date_joined: '',
          },
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
      ];

      setAgendas(mockAgendas);
    } catch (err) {
      setError('Failed to fetch agendas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  /* -------------------- Handlers -------------------- */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, agenda: Agenda) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgenda(agenda);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAgenda(null);
  };

  const handleEdit = () => {
    if (selectedAgenda) navigate(`/universities/agendas/${selectedAgenda.id}/edit`);
    handleMenuClose();
  };

  const handleDuplicate = () => {
    if (selectedAgenda) console.log('Duplicate agenda:', selectedAgenda.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedAgenda) console.log('Delete agenda:', selectedAgenda.id);
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    if (selectedAgenda) console.log('Toggle status for agenda:', selectedAgenda.id);
    handleMenuClose();
  };

  /* -------------------- Filtering -------------------- */
  const filteredAgendas = agendas.filter(agenda => {
    const matchesSearch =
      agenda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agenda.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !selectedTheme || agenda.theme.id === Number(selectedTheme);
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === 'active' && agenda.is_active) ||
      (selectedStatus === 'inactive' && !agenda.is_active);

    return matchesSearch && matchesTheme && matchesStatus;
  });

  /* -------------------- Guard / Loading / Error -------------------- */
  if (!isUniversityStaff && !isAdmin) {
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
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading agendas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAgendas} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  /* -------------------- Render -------------------- */
  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <Event sx={{ mr: 1, verticalAlign: 'middle' }} /> Manage Agendas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/universities/agendas/create')}
        >
          Create New Agenda
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Agendas
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search agendas..."
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
              <InputLabel>Theme</InputLabel>
              <Select
                value={selectedTheme}
                onChange={e => setSelectedTheme(e.target.value)}
                label="Theme"
              >
                <MenuItem value="">All Themes</MenuItem>
                {themes.map(theme => (
                  <MenuItem key={theme.id} value={theme.id.toString()}>
                    {theme.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedTheme('');
                setSelectedStatus('');
              }}
              sx={{ height: 56 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {filteredAgendas.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No agendas found matching your criteria. Try adjusting your filters or create a new
              agenda.
            </Alert>
          </Grid>
        ) : (
          filteredAgendas.map(agenda => (
            <Grid item xs={12} md={6} lg={4} key={agenda.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: agenda.theme.color_code,
                          mr: 2,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Event />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {agenda.name}
                        </Typography>
                        <Chip
                          label={agenda.is_active ? 'Active' : 'Inactive'}
                          color={agenda.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <IconButton onClick={e => handleMenuOpen(e, agenda)} size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {agenda.description}
                  </Typography>

                  <Box mb={2}>
                    <Chip
                      label={agenda.theme.name}
                      size="small"
                      sx={{
                        bgcolor: agenda.theme.color_code,
                        color: 'white',
                        mr: 1,
                      }}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {agenda.slot_duration_minutes} minutes per slot
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Max {agenda.max_capacity_per_slot} participant(s) per slot
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Event sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(agenda.start_date).toLocaleDateString()} -{' '}
                      {new Date(agenda.end_date).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Created by: {agenda.created_by.first_name} {agenda.created_by.last_name}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/universities/agendas/${agenda.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/universities/agendas/${agenda.id}/edit`)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {selectedAgenda?.is_active ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};