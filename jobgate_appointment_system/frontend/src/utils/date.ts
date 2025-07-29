import { format, parseISO, isValid, addDays, subDays, startOfDay, endOfDay, isSameDay, isAfter, isBefore, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { DATE_FORMATS } from '../constants';

// Date formatting utilities
export const formatDate = (date: Date | string, formatString: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch {
    return '';
  }
};

export const formatDisplayDate = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY);
};

export const formatInputDate = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.INPUT);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.DATETIME);
};

export const formatTime = (time: string): string => {
  try {
    // Handle time strings like "14:30:00" or "14:30"
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return format(date, DATE_FORMATS.TIME);
  } catch {
    return time;
  }
};

// Date parsing utilities
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

export const parseDateTime = (dateString: string, timeString: string): Date | null => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    return date;
  } catch {
    return null;
  }
};

// Date comparison utilities
export const isDateInFuture = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) && isAfter(dateObj, new Date());
  } catch {
    return false;
  }
};

export const isDateInPast = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) && isBefore(dateObj, new Date());
  } catch {
    return false;
  }
};

export const isDateToday = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) && isSameDay(dateObj, new Date());
  } catch {
    return false;
  }
};

export const isDateInRange = (date: Date | string, startDate: Date | string, endDate: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(dateObj) || !isValid(startObj) || !isValid(endObj)) return false;
    
    return (isAfter(dateObj, startObj) || isSameDay(dateObj, startObj)) &&
           (isBefore(dateObj, endObj) || isSameDay(dateObj, endObj));
  } catch {
    return false;
  }
};

// Date calculation utilities
export const addDaysToDate = (date: Date | string, days: number): Date | null => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return addDays(dateObj, days);
  } catch {
    return null;
  }
};

export const subtractDaysFromDate = (date: Date | string, days: number): Date | null => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return subDays(dateObj, days);
  } catch {
    return null;
  }
};

export const getStartOfDay = (date: Date | string): Date | null => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return startOfDay(dateObj);
  } catch {
    return null;
  }
};

export const getEndOfDay = (date: Date | string): Date | null => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return endOfDay(dateObj);
  } catch {
    return null;
  }
};

// Time difference utilities
export const getMinutesDifference = (startDate: Date | string, endDate: Date | string): number => {
  try {
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(startObj) || !isValid(endObj)) return 0;
    
    return differenceInMinutes(endObj, startObj);
  } catch {
    return 0;
  }
};

export const getHoursDifference = (startDate: Date | string, endDate: Date | string): number => {
  try {
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(startObj) || !isValid(endObj)) return 0;
    
    return differenceInHours(endObj, startObj);
  } catch {
    return 0;
  }
};

export const getDaysDifference = (startDate: Date | string, endDate: Date | string): number => {
  try {
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(startObj) || !isValid(endObj)) return 0;
    
    return differenceInDays(endObj, startObj);
  } catch {
    return 0;
  }
};

// Appointment-specific utilities
export const isAppointmentUpcoming = (slotDate: string, startTime: string): boolean => {
  try {
    const appointmentDateTime = parseDateTime(slotDate, startTime);
    if (!appointmentDateTime) return false;
    
    return isAfter(appointmentDateTime, new Date());
  } catch {
    return false;
  }
};

export const getAppointmentStatus = (slotDate: string, startTime: string, endTime: string): 'upcoming' | 'ongoing' | 'past' => {
  try {
    const now = new Date();
    const startDateTime = parseDateTime(slotDate, startTime);
    const endDateTime = parseDateTime(slotDate, endTime);
    
    if (!startDateTime || !endDateTime) return 'past';
    
    if (isBefore(now, startDateTime)) return 'upcoming';
    if (isAfter(now, endDateTime)) return 'past';
    return 'ongoing';
  } catch {
    return 'past';
  }
};

export const getTimeUntilAppointment = (slotDate: string, startTime: string): string => {
  try {
    const appointmentDateTime = parseDateTime(slotDate, startTime);
    if (!appointmentDateTime) return '';
    
    const now = new Date();
    const minutesDiff = differenceInMinutes(appointmentDateTime, now);
    
    if (minutesDiff < 0) return 'Past';
    if (minutesDiff < 60) return `${minutesDiff} minutes`;
    
    const hoursDiff = Math.floor(minutesDiff / 60);
    const remainingMinutes = minutesDiff % 60;
    
    if (hoursDiff < 24) {
      return remainingMinutes > 0 
        ? `${hoursDiff}h ${remainingMinutes}m`
        : `${hoursDiff} hours`;
    }
    
    const daysDiff = Math.floor(hoursDiff / 24);
    const remainingHours = hoursDiff % 24;
    
    return remainingHours > 0
      ? `${daysDiff}d ${remainingHours}h`
      : `${daysDiff} days`;
  } catch {
    return '';
  }
};

// Booking deadline utilities
export const isBookingDeadlinePassed = (slotDate: string, startTime: string, deadlineHours: number): boolean => {
  try {
    const appointmentDateTime = parseDateTime(slotDate, startTime);
    if (!appointmentDateTime) return true;
    
    const deadlineDateTime = new Date(appointmentDateTime.getTime() - (deadlineHours * 60 * 60 * 1000));
    return isAfter(new Date(), deadlineDateTime);
  } catch {
    return true;
  }
};

export const isCancellationDeadlinePassed = (slotDate: string, startTime: string, deadlineHours: number): boolean => {
  return isBookingDeadlinePassed(slotDate, startTime, deadlineHours);
};

// Calendar utilities
export const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes: number): string[] => {
  try {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      slots.push(format(current, 'HH:mm'));
      current = new Date(current.getTime() + (intervalMinutes * 60 * 1000));
    }
    
    return slots;
  } catch {
    return [];
  }
};

export const getWeekDays = (startDate: Date | string): Date[] => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    if (!isValid(start)) return [];
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  } catch {
    return [];
  }
};

// Timezone utilities
export const convertToUserTimezone = (date: Date | string, _timezone: string): Date | null => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    
    // This is a simplified implementation
    // In a real application, you might want to use a library like date-fns-tz
    return dateObj;
  } catch {
    return null;
  }
};

export const getCurrentTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

// Validation utilities
export const isValidTimeString = (time: string): boolean => {
  try {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  } catch {
    return false;
  }
};

export const isValidDateString = (date: string): boolean => {
  try {
    const dateObj = parseISO(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};

export const isTimeAfter = (time1: string, time2: string): boolean => {
  try {
    if (!isValidTimeString(time1) || !isValidTimeString(time2)) return false;
    
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    
    return totalMinutes1 > totalMinutes2;
  } catch {
    return false;
  }
};

