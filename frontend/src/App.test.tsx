
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Button, Box, Paper } from '@mui/material';
import { Event, Person, CalendarToday, Dashboard } from '@mui/icons-material';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Test pages
const TestDashboard = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Dashboard
    </Typography>
    <Box display="flex" gap={2} mb={3}>
      <Paper sx={{ p: 3, flex: 1, textAlign: 'center' }}>
        <Event sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5">25</Typography>
        <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
      </Paper>
      <Paper sx={{ p: 3, flex: 1, textAlign: 'center' }}>
        <Person sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
        <Typography variant="h5">12</Typography>
        <Typography variant="body2" color="text.secondary">Active Users</Typography>
      </Paper>
    </Box>
    <Typography variant="body1" color="text.secondary">
      Welcome to the JobGate Appointment System! This is a test version of the dashboard.
    </Typography>
  </Container>
);

const TestCalendar = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Calendar
    </Typography>
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <CalendarToday sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Calendar View
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Interactive calendar component will be displayed here.
      </Typography>
    </Paper>
  </Container>
);

const TestAppointments = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Appointments
    </Typography>
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Event sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Appointments Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Appointment cards and management interface will be displayed here.
      </Typography>
    </Paper>
  </Container>
);

const TestHome = () => (
  <Container maxWidth="md" sx={{ mt: 4 }}>
    <Box textAlign="center" mb={4}>
      <Typography variant="h3" gutterBottom>
        JobGate Appointment System
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Frontend Test Application
      </Typography>
      <Typography variant="body1" paragraph>
        This is a test version of the React TypeScript frontend built with Vite, MUI, and other modern technologies.
      </Typography>
    </Box>

    <Box display="flex" justifyContent="center" gap={2} mb={4}>
      <Button variant="contained" href="#/dashboard" startIcon={<Dashboard />}>
        Dashboard
      </Button>
      <Button variant="outlined" href="#/calendar" startIcon={<CalendarToday />}>
        Calendar
      </Button>
      <Button variant="outlined" href="#/appointments" startIcon={<Event />}>
        Appointments
      </Button>
    </Box>

    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Features Implemented:
      </Typography>
      <Box component="ul" sx={{ pl: 2 }}>
        <li>React 18 with TypeScript</li>
        <li>Vite for fast development and building</li>
        <li>Material-UI (MUI) for components and theming</li>
        <li>React Router for navigation</li>
        <li>React Query for data fetching</li>
        <li>Zustand for state management</li>
        <li>Formik for form handling</li>
        <li>Tiptap for rich text editing</li>
        <li>Axios for HTTP requests</li>
        <li>Date-fns for date utilities</li>
      </Box>
    </Paper>
  </Container>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<TestHome />} />
            <Route path="/dashboard" element={<TestDashboard />} />
            <Route path="/calendar" element={<TestCalendar />} />
            <Route path="/appointments" element={<TestAppointments />} />
            <Route path="*" element={<TestHome />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

