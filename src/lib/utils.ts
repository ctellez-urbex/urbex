import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Conditional logging system
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  }
};

/**
 * Date formatting utilities
 * Utilidades para formateo de fechas
 */

/**
 * Formats an ISO date string to a readable format
 * Formatea una fecha ISO a un formato legible
 * 
 * @param isoString - ISO date string (e.g., "2025-02-04T19:26:54.411000+00:00")
 * @param options - Date formatting options
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  try {
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error de formato';
  }
}

/**
 * Formats an ISO date string to show only the date (no time)
 * Formatea una fecha ISO mostrando solo la fecha (sin hora)
 * 
 * @param isoString - ISO date string
 * @returns Formatted date string
 */
export function formatDateOnly(isoString: string): string {
  return formatDate(isoString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats an ISO date string to show date and time
 * Formatea una fecha ISO mostrando fecha y hora
 * 
 * @param isoString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(isoString: string): string {
  return formatDate(isoString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formats an ISO date string to show relative time (e.g., "hace 2 horas")
 * Formatea una fecha ISO mostrando tiempo relativo
 * 
 * @param isoString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      return 'En el futuro';
    }
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `Hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `Hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Error de formato';
  }
} 