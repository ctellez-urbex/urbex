/**
 * API Configuration for External APIs
 * 
 * Configuración simplificada para llamar APIs externas
 * Compatible con S3 + CloudFront (contenido estático)
 */

// Helper function to get environment variables from static file
function getStaticEnvVar(key: string, fallback: string = ''): string {
  // Try to get from window.ENV (static file)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Fallback to process.env (for development)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return fallback;
}

// Helper function to check if API is configured
function isApiConfigured(): boolean {
  const apiUrl = getStaticEnvVar('NEXT_PUBLIC_API_BASE_URL');
  const apiKey = getStaticEnvVar('NEXT_PUBLIC_API_KEY');
  
  return !!(apiUrl && apiKey && 
           !apiUrl.includes('your_') && !apiUrl.includes('tu_') &&
           !apiKey.includes('your_') && !apiKey.includes('tu_'));
}

export const API_CONFIG = {
  // URL base de la API externa
  BASE_URL: getStaticEnvVar('NEXT_PUBLIC_API_BASE_URL', 'https://api.urbex.com.co'),
  
  // API Key para autenticación
  API_KEY: getStaticEnvVar('NEXT_PUBLIC_API_KEY', ''),
  
  // Endpoints específicos
  ENDPOINTS: {
    CONTACT: '/contact',
    HEALTH: '/health'
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

// Log API configuration
if (typeof window !== 'undefined') {
  console.log('🔗 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    hasApiKey: !!API_CONFIG.API_KEY,
    isConfigured: isApiConfigured(),
    environment: getStaticEnvVar('NODE_ENV', 'production')
  });
  
  if (!isApiConfigured()) {
    console.warn('⚠️  API is not properly configured. Check your /public/env.js file.');
  }
} 