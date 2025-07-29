import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Container,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validation';
import { ROUTES } from '../../constants';
import type { LoginCredentials } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuth();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (values: LoginCredentials) => {
    const success = await login(values);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    
      <Container
        component="main"
        maxWidth="md"          // <<<< bigger center box
        sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',   // vertically center
       }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,      // tighter inner card
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            JobGate
          </Typography>
          <Typography component="h2" variant="h5" gutterBottom>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Forgot password link */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link
                    component={RouterLink}
                    to={ROUTES.FORGOT_PASSWORD}
                    variant="body2"
                  >
                    Forgot your password?
                  </Link>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Link component={RouterLink} to={ROUTES.REGISTER} variant="body2">
                    Don't have an account? Sign Up
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};