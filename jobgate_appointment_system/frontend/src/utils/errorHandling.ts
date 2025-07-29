interface ApiError {
  response?: {
    data?: {
      email?: string[];
      new_password?: string[];
      token?: string[];
      uid?: string[];
      non_field_errors?: string[];
      detail?: string;
    };
    status?: number;
  };
  message?: string;
}

export const getPasswordResetErrorMessage = (error: ApiError): string => {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle specific field errors
    if (data.email) {
      return data.email[0];
    }
    
    if (data.new_password) {
      return data.new_password[0];
    }
    
    if (data.token) {
      return 'Invalid or expired password reset link. Please request a new password reset.';
    }
    
    if (data.uid) {
      return 'Invalid password reset link. Please request a new password reset.';
    }
    
    if (data.non_field_errors) {
      return data.non_field_errors[0];
    }
    
    if (data.detail) {
      return data.detail;
    }
  }
  
  // Handle network errors
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  
  if (typeof error.response?.status === 'number' && error.response.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  return 'An unexpected error occurred. Please try again later.';
};

export const getSuccessMessage = (type: 'request' | 'confirm'): string => {
  switch (type) {
    case 'request':
      return 'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.';
    case 'confirm':
      return 'Your password has been successfully reset. You can now sign in with your new password.';
    default:
      return 'Operation completed successfully.';
  }
};