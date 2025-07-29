// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// components
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationSnackbar } from './components/common/NotificationSnackbar';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// pages – static imports stay the same
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { AppointmentDetailsPage } from './pages/appointments/AppointmentDetailsPage';
import { BookAppointmentPage } from './pages/appointments/BookAppointmentPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { PreferencesPage } from './pages/profile/PreferencesPage';
import { UniversitiesPage } from './pages/universities/UniversitiesPage';
import { ManageAgendasPage } from './pages/universities/ManageAgendasPage';
import { CreateAgendaPage } from './pages/universities/CreateAgendaPage';
import { AgendaDetailsPage } from './pages/universities/AgendaDetailsPage';
import { ManageSlotsPage } from './pages/universities/ManageSlotsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { UniversityManagementPage } from './pages/admin/UniversityManagementPage';
import { SystemStatisticsPage } from './pages/admin/SystemStatisticsPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// constants
import { ROUTES, THEME_COLORS } from './constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 1 },
  },
});

const theme = createTheme({
  palette: {
    primary:   { main: THEME_COLORS.PRIMARY },
    secondary: { main: THEME_COLORS.SECONDARY },
    success:   { main: THEME_COLORS.SUCCESS },
    error:     { main: THEME_COLORS.ERROR },
    warning:   { main: THEME_COLORS.WARNING },
    info:      { main: THEME_COLORS.INFO },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton:  { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
    MuiCard:    { styleOverrides: { root: { borderRadius: 12 } } },
    MuiPaper:   { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />

            <Routes>
              {/* Public routes */}
              <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Everything else is behind a single ProtectedRoute */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index          element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* General user screens */}
                <Route path="calendar"                    element={<CalendarPage />} />
                <Route path="appointments"                element={<AppointmentsPage />} />
                <Route path="appointments/:id"            element={<AppointmentDetailsPage />} />
                <Route path="appointments/book"           element={<BookAppointmentPage />} />
                <Route path="profile"                     element={<ProfilePage />} />
                <Route path="profile/preferences"         element={<PreferencesPage />} />

                {/* University-staff screens */}
                <Route
                  path="universities"
                  element={<ProtectedRoute requiredRoles={['admin', 'university_staff']}><UniversitiesPage /></ProtectedRoute>}
                />
                <Route
                  path="universities/agendas"
                  element={<ProtectedRoute requiredRoles={['admin', 'university_staff']}><ManageAgendasPage /></ProtectedRoute>}
                />
                <Route
                  path="universities/agendas/create"
                  element={<ProtectedRoute requiredRoles={['admin', 'university_staff']}><CreateAgendaPage /></ProtectedRoute>}
                />
                <Route
                  path="universities/agendas/:id"
                  element={<ProtectedRoute requiredRoles={['admin', 'university_staff']}><AgendaDetailsPage /></ProtectedRoute>}
                />
                <Route
                  path="universities/slots"
                  element={<ProtectedRoute requiredRoles={['admin', 'university_staff']}><ManageSlotsPage /></ProtectedRoute>}
                />

                {/* Admin screens */}
                <Route
                  path="admin"
                  element={<ProtectedRoute requiredRoles={"admin"}><AdminDashboardPage /></ProtectedRoute>}
                />
                <Route
                  path="admin/users"
                  element={<ProtectedRoute requiredRoles={"admin"}><UserManagementPage /></ProtectedRoute>}
                />
                <Route
                  path="admin/universities"
                  element={<ProtectedRoute requiredRoles={"admin"}><UniversityManagementPage /></ProtectedRoute>}
                />
                <Route
                  path="admin/statistics"
                  element={<ProtectedRoute requiredRoles={"admin"}><SystemStatisticsPage /></ProtectedRoute>}
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              </Route>
            </Routes>

            <NotificationSnackbar />
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;