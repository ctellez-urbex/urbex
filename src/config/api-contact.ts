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
  // Modo desarrollo: simular envío exitoso
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 DEV MODE: Simulating contact form submission');
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respuesta exitosa
    return {
      success: true,
      message: 'Mensaje enviado exitosamente'
    };
  }
  
  // Modo producción: usar API real
  return apiRequest('/contact/', {
    method: 'POST',
    body: JSON.stringify({
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
    })
  });
} 