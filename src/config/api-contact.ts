/**
 * Contact API Configuration
 * 
 * Handles contact form submissions and related functionality
 */

import { apiRequest } from './api';

/**
 * Contact form data interface
 */
export interface ContactFormData {
  full_name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Send contact form data
 * 
 * @param formData - Contact form data
 * @returns Promise with the response
 */
export async function sendContactForm(formData: ContactFormData) {  
  return apiRequest('/contact/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
    })
  });
} 