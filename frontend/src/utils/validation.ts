import * as yup from 'yup';
import { VALIDATION } from '../constants';

// Common validation schemas
export const validationSchemas = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  
  password: yup
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .required('Password is required'),
  
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  
  username: yup
    .string()
    .min(VALIDATION.USERNAME_MIN_LENGTH, `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`)
    .max(VALIDATION.USERNAME_MAX_LENGTH, `Username must not exceed ${VALIDATION.USERNAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  
  firstName: yup
    .string()
    .max(VALIDATION.NAME_MAX_LENGTH, `First name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
    .required('First name is required'),
  
  lastName: yup
    .string()
    .max(VALIDATION.NAME_MAX_LENGTH, `Last name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
    .required('Last name is required'),
  
  phoneNumber: yup
    .string()
    .matches(VALIDATION.PHONE_PATTERN, 'Please enter a valid phone number')
    .nullable(),
  
  userType: yup
    .string()
    .oneOf(['talent', 'university_staff'], 'Please select a valid user type')
    .required('User type is required'),
};

// Authentication form schemas
export const loginSchema = yup.object({
  email: validationSchemas.email,
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  email: validationSchemas.email,
  username: validationSchemas.username,
  first_name: validationSchemas.firstName,
  last_name: validationSchemas.lastName,
  user_type: validationSchemas.userType,
  phone_number: validationSchemas.phoneNumber,
  password: validationSchemas.password,
  re_password: validationSchemas.confirmPassword,
});

export const forgotPasswordSchema = yup.object({
  email: validationSchemas.email,
});

export const resetPasswordSchema = yup.object({
  new_password: validationSchemas.password,
  re_new_password: validationSchemas.confirmPassword,
});

// Profile form schemas
export const profileUpdateSchema = yup.object({
  first_name: validationSchemas.firstName,
  last_name: validationSchemas.lastName,
  phone_number: validationSchemas.phoneNumber,
});

export const changePasswordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: validationSchemas.password,
  re_new_password: validationSchemas.confirmPassword,
});

// Appointment form schemas
export const appointmentBookingSchema = yup.object({
  calendar_slot_id: yup.number().required('Please select a time slot'),
  talent_notes: yup.string().max(1000, 'Notes must not exceed 1000 characters'),
});

// Agenda form schemas
export const agendaCreateSchema = yup.object({
  name: yup
    .string()
    .max(255, 'Name must not exceed 255 characters')
    .required('Agenda name is required'),
  
  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters'),
  
  theme_id: yup
    .number()
    .required('Please select a theme'),
  
  slot_duration_minutes: yup
    .number()
    .min(1, 'Slot duration must be at least 1 minute')
    .max(480, 'Slot duration must not exceed 8 hours')
    .required('Slot duration is required'),
  
  max_capacity_per_slot: yup
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(100, 'Capacity must not exceed 100')
    .required('Maximum capacity is required'),
  
  start_date: yup
    .date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  
  end_date: yup
    .date()
    .min(yup.ref('start_date'), 'End date must be after start date')
    .required('End date is required'),
  
  booking_deadline_hours: yup
    .number()
    .min(1, 'Booking deadline must be at least 1 hour')
    .max(168, 'Booking deadline must not exceed 1 week')
    .required('Booking deadline is required'),
  
  cancellation_deadline_hours: yup
    .number()
    .min(1, 'Cancellation deadline must be at least 1 hour')
    .max(168, 'Cancellation deadline must not exceed 1 week')
    .required('Cancellation deadline is required'),
});

// Calendar slot form schemas
export const calendarSlotCreateSchema = yup.object({
  agenda_id: yup
    .number()
    .required('Please select an agenda'),
  
  staff_id: yup
    .number()
    .required('Please select a staff member'),
  
  slot_date: yup
    .date()
    .min(new Date(), 'Slot date must be in the future')
    .required('Slot date is required'),
  
  start_time: yup
    .string()
    .required('Start time is required'),
  
  end_time: yup
    .string()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      return value > start_time;
    }),
  
  max_capacity: yup
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(100, 'Capacity must not exceed 100')
    .required('Maximum capacity is required'),
  
  notes: yup
    .string()
    .max(500, 'Notes must not exceed 500 characters'),
  
  location: yup
    .string()
    .max(255, 'Location must not exceed 255 characters'),
  
  meeting_type: yup
    .string()
    .oneOf(['in_person', 'online', 'phone'], 'Please select a valid meeting type')
    .required('Meeting type is required'),
  
  meeting_link: yup
    .string()
    .url('Please enter a valid URL')
    .when('meeting_type', {
      is: 'online',
      then: (schema) => schema.required('Meeting link is required for online meetings'),
      otherwise: (schema) => schema.nullable(),
    }),
});

// University profile form schemas
export const universityProfileSchema = yup.object({
  display_name: yup
    .string()
    .max(100, 'Display name must not exceed 100 characters')
    .required('Display name is required'),
});

// User preferences form schemas
export const userPreferencesSchema = yup.object({
  email_reminders_enabled: yup.boolean(),
  reminder_24h_enabled: yup.boolean(),
  reminder_1h_enabled: yup.boolean(),
  preferred_meeting_type: yup
    .string()
    .oneOf(['in_person', 'online', 'phone', 'any'], 'Please select a valid meeting type'),
  user_timezone: yup.string(),
  language: yup.string(),
});

// Validation helper functions
export const validateField = async (
  schema: yup.AnySchema,
  value: any,
  field: string
): Promise<string | null> => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation error';
  }
};

export const validateForm = async (
  schema: yup.AnySchema,
  values: any
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation error' } };
  }
};

// Custom validation functions
export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false;
  return endTime > startTime;
};

export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  if (!startDate || !endDate) return false;
  return endDate >= startDate;
};

export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_PATTERN.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  return VALIDATION.PHONE_PATTERN.test(phone);
};

export const isStrongPassword = (password: string): boolean => {
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= VALIDATION.PASSWORD_MIN_LENGTH) {
    score += 1;
  } else {
    feedback.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }
  
  return { score, feedback };
};

