import { format as dateFnsFormat, formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

// Angola timezone (WAT - West Africa Time, UTC+1)
export const ANGOLA_TIMEZONE = 'Africa/Luanda';

// Custom locale configuration for Angola (using Portuguese as base)
export const angolaLocale = ptBR;

/**
 * Format date in Angola timezone
 * @param date - Date to format
 * @param formatStr - Format string
 * @param options - Additional options
 * @returns Formatted date string in Angola timezone
 */
export const formatInAngolaTime = (
  date: Date | string | number,
  formatStr: string,
  options?: { locale?: any }
) => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return formatInTimeZone(
    dateObj,
    ANGOLA_TIMEZONE,
    formatStr,
    {
      locale: angolaLocale,
      ...options,
    }
  );
};

/**
 * Get current date/time in Angola timezone
 * @returns Date object adjusted to Angola timezone
 */
export const getAngolaTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: ANGOLA_TIMEZONE }));
};

/**
 * Convert date to Angola timezone
 * @param date - Date to convert
 * @returns Date object in Angola timezone
 */
export const toAngolaTime = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString("en-US", { timeZone: ANGOLA_TIMEZONE }));
};

/**
 * Format date for display in Angola (common formats)
 */
export const formatAngolaDate = {
  /**
   * Format as dd/MM/yyyy
   */
  short: (date: Date | string | number) => 
    formatInAngolaTime(date, 'dd/MM/yyyy'),
  
  /**
   * Format as dd/MM/yyyy HH:mm
   */
  medium: (date: Date | string | number) => 
    formatInAngolaTime(date, 'dd/MM/yyyy HH:mm'),
  
  /**
   * Format as dd/MM/yyyy 'às' HH:mm
   */
  long: (date: Date | string | number) => 
    formatInAngolaTime(date, "dd/MM/yyyy 'às' HH:mm"),
  
  /**
   * Format as full date (e.g., "segunda-feira, 27 de janeiro de 2025")
   */
  full: (date: Date | string | number) => 
    formatInAngolaTime(date, 'EEEE, dd \'de\' MMMM \'de\' yyyy'),
  
  /**
   * Format for calendar display (PPP format)
   */
  calendar: (date: Date | string | number) => 
    formatInAngolaTime(date, 'PPP'),
  
  /**
   * Format time only (HH:mm)
   */
  time: (date: Date | string | number) => 
    formatInAngolaTime(date, 'HH:mm'),
  
  /**
   * Format for relative time display
   */
  relative: (date: Date | string | number) => {
    const now = getAngolaTime();
    const targetDate = toAngolaTime(date);
    const diffInHours = Math.abs(now.getTime() - targetDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatInAngolaTime(targetDate, 'HH:mm');
    } else if (diffInHours < 24 * 7) {
      return formatInAngolaTime(targetDate, 'EEEE HH:mm');
    } else {
      return formatInAngolaTime(targetDate, 'dd/MM/yyyy');
    }
  }
};

/**
 * Check if a date is today in Angola timezone
 */
export const isToday = (date: Date | string | number): boolean => {
  const today = getAngolaTime();
  const targetDate = toAngolaTime(date);
  
  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

/**
 * Check if a date is in the past (Angola timezone)
 */
export const isPast = (date: Date | string | number): boolean => {
  const now = getAngolaTime();
  const targetDate = toAngolaTime(date);
  return targetDate < now;
};

/**
 * Check if a date is in the future (Angola timezone)
 */
export const isFuture = (date: Date | string | number): boolean => {
  const now = getAngolaTime();
  const targetDate = toAngolaTime(date);
  return targetDate > now;
};

/**
 * Get start of day in Angola timezone
 */
export const startOfDayAngola = (date: Date | string | number): Date => {
  const targetDate = toAngolaTime(date);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

/**
 * Get end of day in Angola timezone
 */
export const endOfDayAngola = (date: Date | string | number): Date => {
  const targetDate = toAngolaTime(date);
  targetDate.setHours(23, 59, 59, 999);
  return targetDate;
};

/**
 * Add days to a date in Angola timezone
 */
export const addDaysAngola = (date: Date | string | number, days: number): Date => {
  const targetDate = toAngolaTime(date);
  targetDate.setDate(targetDate.getDate() + days);
  return targetDate;
};

/**
 * Format duration in Portuguese
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Parse date string ensuring Angola timezone
 */
export const parseAngolaDate = (dateString: string): Date => {
  // If the string doesn't include timezone info, assume it's in Angola timezone
  if (!dateString.includes('T') || (!dateString.includes('+') && !dateString.includes('Z'))) {
    // Add Angola timezone offset
    return new Date(dateString + '+01:00');
  }
  
  return toAngolaTime(new Date(dateString));
};

/**
 * Convert date to ISO string in Angola timezone
 */
export const toAngolaISOString = (date: Date | string | number): string => {
  const angolaDate = toAngolaTime(date);
  return angolaDate.toISOString();
};