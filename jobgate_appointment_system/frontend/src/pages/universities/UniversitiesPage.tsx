// UniversitiesPage.tsx
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
  TablePagination,
} from '@mui/material';
import { Add, Edit, Delete, Search, School } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import type { UniversityProfile } from '../../types';

export const UniversitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [universities, setUniversities] = useState<UniversityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* -------------------------------------------------------------- */
  /* MOCK FETCH                                                     */
  /* -------------------------------------------------------------- */
  const fetchUniversities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiMethods.get<UniversityProfile[]>("/universities/");
        const data = Array.isArray(response as any)
          ? response
          : Array.isArray((response as any)?.results)
          ? (response as any).results
          : [];
        setUniversities(data);
      } catch (err) {
        setError("Failed to fetch universities.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const safeUniversities = Array.isArray(universities) ? universities : [];

  const filtered = safeUniversities.filter(uni =>
    uni.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (!isAdmin) {
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading universities...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchUniversities} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <School sx={{ mr: 1, verticalAlign: 'middle' }} /> University Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/universities/create')}
        >
          Add New University
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="Search universities..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>University Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No universities found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(uni => (
                  <TableRow key={uni.id}>
                    <TableCell>{uni.display_name}</TableCell>
                    <TableCell>User ID: {uni.created_by}</TableCell>
                    <TableCell>{new Date(uni.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => navigate(`/universities/${uni.id}/edit`)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => console.log('Delete', uni.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};