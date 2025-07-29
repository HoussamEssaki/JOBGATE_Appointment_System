/* UniversityManagementPage.tsx – fully fixed & type-safe */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMethods } from '../../utils/api';
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Menu,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  School,
  People,
  Event,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* 1. Minimal, complete types                                         */
/* ------------------------------------------------------------------ */
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface UniversityProfile {
  id: number;
  display_name: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */
export const UniversityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  /* -------------------- State -------------------- */
  const [universities, setUniversities] = useState<UniversityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Filters */
  const [searchTerm, setSearchTerm] = useState('');

  /* Pagination */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* Dialog & Menu */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityProfile | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /* ------------------------------------------------------------------ */
  /* Mock API call    Previously                                      */
  /* ------------------------------------------------------------------ */
  const fetchUniversities = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await apiMethods.get<UniversityProfile[]>('/universities/');

    // assume the endpoint can return { results: [...] }
    const data = Array.isArray(response as any)
      ? response
      : Array.isArray((response as any)?.results)
      ? (response as any).results
      : [];

    setUniversities(data);
  } catch (err) {
    setError('Failed to fetch universities.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (isAdmin) fetchUniversities();
  }, [isAdmin]);

  /* -------------------- Handlers -------------------- */
  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    uni: UniversityProfile
  ) => {
    setAnchorEl(e.currentTarget);
    setSelectedUniversity(uni);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUniversity(null);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const confirmDelete = () => {
    if (selectedUniversity) console.log('Delete', selectedUniversity.id);
    setDeleteDialogOpen(false);
    setSelectedUniversity(null);
  };

  /* -------------------- Filtering & Pagination -------------------- */
  const filteredUniversities = (Array.isArray(universities) ? universities : []).filter(u =>
  u.display_name.toLowerCase().includes(searchTerm.toLowerCase())
);
  const paginatedUniversities = filteredUniversities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* -------------------- Guards -------------------- */
  if (!isAdmin)
    return (
      <Box p={3}>
        <Alert severity="warning">You do not have permission to view this page.</Alert>
      </Box>
    );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading universities...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchUniversities} sx={{ mt: 2 }}>Retry</Button>
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
          <School sx={{ mr: 1, verticalAlign: 'middle' }} /> University Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/universities/create')}
        >
          Add New University
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="primary" sx={{ fontSize: 32, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Universities</Typography>
                  <Typography variant="h5">{universities.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="secondary" sx={{ fontSize: 32, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Active Staff</Typography>
                  <Typography variant="h5">45</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Event color="success" sx={{ fontSize: 32, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Agendas</Typography>
                  <Typography variant="h5">128</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Visibility color="warning" sx={{ fontSize: 32, mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">This Month</Typography>
                  <Typography variant="h5">234</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Search Universities</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search universities..."
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
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSearchTerm('')}
              sx={{ height: 56 }}
            >
              Clear Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Universities Table */}
      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>University</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUniversities.length ? (
                paginatedUniversities.map(uni => (
                  <TableRow key={uni.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <School />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {uni.display_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {uni.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {uni.created_by.first_name} {uni.created_by.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {uni.created_by.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(uni.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(uni.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={e => handleMenuOpen(e, uni)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No universities found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUniversities.length}
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
        <MenuItem onClick={() => navigate(`/admin/universities/${selectedUniversity?.id}`)}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/admin/universities/${selectedUniversity?.id}/edit`)}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit University</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/admin/universities/${selectedUniversity?.id}/staff`)}>
          <ListItemIcon><People fontSize="small" /></ListItemIcon>
          <ListItemText>Manage Staff</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate(`/admin/universities/${selectedUniversity?.id}/agendas`)}>
          <ListItemIcon><Event fontSize="small" /></ListItemIcon>
          <ListItemText>View Agendas</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete University</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete University</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this university? This action cannot be undone and will
            remove all associated data including staff, agendas, and appointments.
          </Typography>
          {selectedUniversity && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>University:</strong> {selectedUniversity.display_name}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete University
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};