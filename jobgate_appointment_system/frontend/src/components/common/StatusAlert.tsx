import React from 'react';
import { Alert, type AlertProps, Collapse } from '@mui/material';

interface StatusAlertProps extends Omit<AlertProps, 'children'> {
  show: boolean;
  message: string;
  onClose?: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  show,
  message,
  onClose,
  ...props
}) => {
  return (
    <Collapse in={show}>
      <Alert
        {...props}
        onClose={onClose}
        sx={{ mb: 2, ...props.sx }}
      >
        {message}
      </Alert>
    </Collapse>
  );
};

export default StatusAlert;