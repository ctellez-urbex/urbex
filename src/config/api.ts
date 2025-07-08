/**
 * API Configuration
 * 
 * Configuración centralizada para las APIs externas
 * Estas variables deben estar disponibles en el frontend (NEXT_PUBLIC_*)
 */

export const API_CONFIG = {
  // URL base de la API externa
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.urbex.com.co',
  
  // API Key para autenticación
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
  
  // Endpoints específicos
  ENDPOINTS: {
    CONTACT: '/contact',
    HEALTH: '/health',
    AUTH: {
      CONFIRM_SIGNUP: '/auth/confirm-signup',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password'
    },
    ADMIN: {
      USERS: '/admin/users',
      USER: (id: string) => `/admin/users/${id}`,
      DISABLE_USER: (id: string) => `/admin/users/${id}/disable`
    },
    USER: {
      ATTRIBUTES: '/user/attributes'
    }
  }
} as const;

/**
 * Función helper para hacer peticiones a la API externa
 * 
 * @param endpoint - Endpoint de la API
 * @param options - Opciones de la petición
 * @returns Promise con la respuesta
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Función específica para el formulario de contacto
 * 
 * @param formData - Datos del formulario
 * @returns Promise con la respuesta
 */
export async function sendContactForm(formData: {
  full_name: string;
  email: string;
  phone: string;
  message: string;
}) {
  return apiRequest(API_CONFIG.ENDPOINTS.CONTACT, {
    method: 'POST',
    body: JSON.stringify({
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
    })
  });
}

/**
 * Función para health check
 * 
 * @returns Promise con la respuesta
 */
export async function healthCheck() {
  return apiRequest(API_CONFIG.ENDPOINTS.HEALTH);
}

/**
 * Función para confirmar registro
 * 
 * @param email - Email del usuario
 * @param code - Código de verificación
 * @returns Promise con la respuesta
 */
export async function confirmSignup(email: string, code: string) {
  return apiRequest(API_CONFIG.ENDPOINTS.AUTH.CONFIRM_SIGNUP, {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

/**
 * Función para solicitar reset de contraseña
 * 
 * @param email - Email del usuario
 * @returns Promise con la respuesta
 */
export async function forgotPassword(email: string) {
  return apiRequest(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

/**
 * Función para resetear contraseña
 * 
 * @param email - Email del usuario
 * @param code - Código de verificación
 * @param newPassword - Nueva contraseña
 * @returns Promise con la respuesta
 */
export async function resetPassword(email: string, code: string, newPassword: string) {
  return apiRequest(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword })
  });
} 