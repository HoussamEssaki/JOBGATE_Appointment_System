import React from 'react';
import type { AlertColor } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { useUIStore } from '../../stores/uiStore';

export const NotificationSnackbar: React.FC = () => {
  const { notification, hideNotification } = useUIStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

