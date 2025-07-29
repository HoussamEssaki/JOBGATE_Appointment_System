import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Link as MuiLink
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingButton from '../../components/common/LoadingButton';
import StatusAlert from '../../components/common/StatusAlert';
import { getSuccessMessage } from '../../utils/errorHandling';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    requestPasswordReset, 
    passwordResetLoading, 
    passwordResetSuccess, 
    passwordResetError,
    clearPasswordResetState 
  } = useAuthStore();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await requestPasswordReset(values.email);
        formik.resetForm();
        
        // Redirect to login after success
        setTimeout(() => {
          navigate('/auth/login');
        }, 5000);
      } catch (error) {
        // Error is handled by the store
      }
    },
  });

  React.useEffect(() => {
    return () => {
      clearPasswordResetState();
    };
  }, [clearPasswordResetState]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Forgot Password
            </Typography>
            
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>

            <StatusAlert
              show={passwordResetSuccess}
              severity="success"
              message={getSuccessMessage('request')}
            />

            <StatusAlert
              show={!!passwordResetError}
              severity="error"
              message={passwordResetError || ''}
            />

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={passwordResetLoading}
              />

              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                loading={passwordResetLoading}
                loadingText="Sending..."
              >
                Send Reset Instructions
              </LoadingButton>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink component={Link} to="/auth/login" variant="body2">
                  Remember your password? Sign in
                </MuiLink>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;