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
  BASE_URL: getStaticEnvVar('NEXT_PUBLIC_API_BASE_URL', 'https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1'),
  
  // API Key para autenticación
  API_KEY: getStaticEnvVar('NEXT_PUBLIC_API_KEY', ''),
  
  // Endpoints específicos
  ENDPOINTS: {
    CONTACT: '/contact/',
    HEALTH: '/health',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register/',
    VERIFY_EMAIL: '/auth/verify-email/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    USER_PROFILE: '/auth/me'
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
 * Tipos para autenticación
 */
export interface LoginCredentials {
  email: string; // Internamente usamos email, pero la API espera username
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user: {
      email: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      su?: string;
      plan?: string;
      name?: string;
    };
    token: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  plan: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  new_password: string;
}

/**
 * Función para login de usuario
 * 
 * @param credentials - Credenciales del usuario
 * @returns Promise con la respuesta de login
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiRequest<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.email.trim(),
        password: credentials.password
      })
    });
    
    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante el login'
    };
  }
}

/**
 * Función para registro de usuario
 * 
 * @param userData - Datos del usuario
 * @returns Promise con la respuesta de registro
 */
export async function registerUser(userData: RegisterData) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email.trim(),
        password: userData.password,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        phone_number: userData.phone_number.trim(),
        plan: userData.plan
      })
    });
    
    return response;
  } catch (error) {
    console.error('Register API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante el registro'
    };
  }
}

/**
 * Función para verificar email
 * 
 * @param verifyData - Datos de verificación
 * @returns Promise con la respuesta de verificación
 */
export async function verifyEmail(verifyData: VerifyEmailData) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({
        email: verifyData.email.trim(),
        code: verifyData.code.trim()
      })
    });
    
    return response;
  } catch (error) {
    console.error('Verify Email API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante la verificación'
    };
  }
}

/**
 * Función para solicitar reset de contraseña
 * 
 * @param forgotData - Datos para reset de contraseña
 * @returns Promise con la respuesta
 */
export async function forgotPassword(forgotData: ForgotPasswordData) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        email: forgotData.email.trim()
      })
    });
    
    return response;
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante la solicitud'
    };
  }
}

/**
 * Función para reset de contraseña
 * 
 * @param resetData - Datos para reset de contraseña
 * @returns Promise con la respuesta
 */
export async function resetPassword(resetData: ResetPasswordData) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        email: resetData.email.trim(),
        code: resetData.code.trim(),
        new_password: resetData.new_password
      })
    });
    
    return response;
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante el reset de contraseña'
    };
  }
}

/**
 * Función para obtener perfil del usuario
 * 
 * @param token - Token de autenticación
 * @returns Promise con los datos del usuario
 */
export async function getUserProfile(token: string) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_CONFIG.API_KEY
      }
    });
    
    return response;
  } catch (error) {
    console.error('Get User Profile API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener perfil'
    };
  }
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