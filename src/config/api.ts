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
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    CONFIRM_EMAIL: '/auth/confirm',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    USER_PROFILE: '/auth/me',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER: '/admin/user/email'
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
  
  // Asegurar que el API key esté presente
  const headers = config.headers as Record<string, string>;
  if (!headers?.['x-api-key']) {
    config.headers = {
      ...config.headers,
      'x-api-key': API_CONFIG.API_KEY
    };
  }
  
  console.log('🌐 API Request:', {
    url,
    method: config.method || 'POST',
    headers: config.headers,
    body: config.body ? JSON.parse(config.body as string) : undefined,
    apiKeyConfigured: !!API_CONFIG.API_KEY,
    apiKeyLength: API_CONFIG.API_KEY?.length || 0,
    baseUrl: API_CONFIG.BASE_URL
  });
  
  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ JSON Parse Error:', jsonError);
      throw new Error('Respuesta no válida del servidor');
    }
    
    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ API Success Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Error:', {
      url,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
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
  su?: string;
}

export interface VerifyEmailData {
  username: string;
  confirmation_code: string;
}

export interface ResendCodeData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  username: string;
  confirmation_code: string;
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
        plan: userData.plan,
        su: userData.su || '1' // Default value for new users
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
    const response = await apiRequest(API_CONFIG.ENDPOINTS.CONFIRM_EMAIL, {
      method: 'POST',
      body: JSON.stringify({
        username: verifyData.username.trim(),
        confirmation_code: verifyData.confirmation_code.trim()
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
 * Función para reenviar código de verificación
 * 
 * @param resendData - Datos para reenviar código
 * @returns Promise con la respuesta
 */
export async function resendVerificationCode(resendData: ResendCodeData) {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        email: resendData.email.trim()
      })
    });
    
    return response;
  } catch (error) {
    console.error('Resend Code API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reenviar el código'
    };
  }
}

/**
 * Función para solicitar reset de contraseña
 * 
 * @param forgotData - Datos para reset de contraseña
 * @param token - Token de autenticación (opcional)
 * @returns Promise con la respuesta
 */
export async function forgotPassword(forgotData: ForgotPasswordData, token?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await apiRequest(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      headers,
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
 * @param token - Token de autenticación (opcional)
 * @returns Promise con la respuesta
 */
export async function resetPassword(resetData: ResetPasswordData, token?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await apiRequest(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: resetData.username.trim(),
        confirmation_code: resetData.confirmation_code.trim(),
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

/**
 * Tipos para administración de usuarios
 */
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: 'CONFIRMED' | 'DISABLED' | 'PENDING';
  status_text: string;
  plan?: string;
  createdAt: string;
  lastLogin?: string;
  su?: string;
}

export interface AdminUserFilters {
  search?: string;
  status?: string;
  plan?: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total?: number;
}

export interface AdminUsersResponse {
  success: boolean;
  data?: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface AdminUserResponse {
  success: boolean;
  data?: AdminUser;
  error?: string;
}

/**
 * Función para obtener la lista de usuarios desde la API externa
 * 
 * @param filters - Filtros de búsqueda (null, '' o 'all' traen todos los usuarios)
 * @param token - Token de autenticación del administrador
 * @returns Promise con la lista completa de usuarios
 */
export async function getAdminUsers(
  filters: AdminUserFilters = {}, 
  token?: string
): Promise<AdminUsersResponse> {
  try {
    console.log('🔍 Getting admin users with filters:', filters);
    
    // Preparar el body con los filtros
    const requestBody: any = {};
    
    // Solo agregar filter si tiene valor y no es vacío
    if (filters.search && filters.search.trim() !== '') {
      requestBody.filter = filters.search.trim();
    }
    
    // Solo agregar status si tiene valor y no es 'all'
    if (filters.status && filters.status !== 'all' && filters.status.trim() !== '') {
      requestBody.status = filters.status.trim();
    }
    
    // Solo agregar plan si tiene valor y no es 'all'
    if (filters.plan && filters.plan !== 'all' && filters.plan.trim() !== '') {
      requestBody.plan = filters.plan.trim();
    }
    
    console.log('📦 Request body:', requestBody);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🔑 Headers:', {
      'Content-Type': headers['Content-Type'],
      'x-api-key': headers['x-api-key'] ? '***' : 'MISSING',
      'Authorization': headers['Authorization'] ? 'Bearer ***' : 'MISSING'
    });
    
    const response = await apiRequest<any>(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log('✅ Admin users response:', response);
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('❌ Get Admin Users API Error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      filters,
      hasToken: !!token
    });
    
    // Manejar errores específicos del servidor
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('500')) {
      return {
        success: false,
        error: 'El endpoint de administración de usuarios no está disponible en este momento. Por favor, contacta al administrador del sistema.'
      };
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        success: false,
        error: 'No tienes permisos para acceder a la administración de usuarios. Verifica tu token de autenticación.'
      };
    }
    
    if (errorMessage.includes('404')) {
      return {
        success: false,
        error: 'El endpoint de administración de usuarios no existe. Verifica la configuración de la API.'
      };
    }
    
    return {
      success: false,
      error: `Error al obtener la lista de usuarios: ${errorMessage}`
    };
  }
}

/**
 * Función para obtener datos de un usuario específico desde la API externa
 * 
 * @param userId - ID del usuario a obtener
 * @param token - Token de autenticación del administrador
 * @returns Promise con los datos del usuario
 */
export async function getAdminUser(
  email: string, 
  token?: string
): Promise<AdminUserResponse> {
  try {
    console.log('🔍 Getting admin user:', {
      email,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      apiKeyConfigured: !!API_CONFIG.API_KEY,
      apiKeyLength: API_CONFIG.API_KEY?.length || 0,
      baseUrl: API_CONFIG.BASE_URL,
      endpoint: `${API_CONFIG.ENDPOINTS.ADMIN_USER}/email/${encodeURIComponent(email)}`,
      fullUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_USER}/email/${encodeURIComponent(email)}`
    });
    
    // Verificar que tenemos el API key
    if (!API_CONFIG.API_KEY) {
      throw new Error('API key no configurada');
    }
    
    // Verificar que tenemos el token
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
      'Authorization': `Bearer ${token}`
    };
    
    console.log('🔑 Headers:', {
      'Content-Type': headers['Content-Type'],
      'x-api-key': headers['x-api-key'] ? '***' : 'MISSING',
      'Authorization': headers['Authorization'] ? 'Bearer ***' : 'MISSING'
    });
    
    // Test de conectividad básico
    console.log('🔍 Testing connectivity to:', API_CONFIG.BASE_URL);
    
    const response = await apiRequest<any>(`${API_CONFIG.ENDPOINTS.ADMIN_USER}/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers
    });
    
    console.log('✅ Admin user response:', response);
    
    return {
      success: response.success,
      data: response.data || response
    };
  } catch (error) {
    console.error('❌ Get Admin User API Error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      email,
      hasToken: !!token,
      fullError: error
    });
    
    // Manejar errores específicos del servidor
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('404')) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        success: false,
        error: 'No tienes permisos para acceder a este usuario. Verifica tu token de autenticación.'
      };
    }
    
    if (errorMessage.includes('500')) {
      return {
        success: false,
        error: 'El servidor no está disponible en este momento. Por favor, intenta más tarde.'
      };
    }
    
    return {
      success: false,
      error: `Error al obtener datos del usuario: ${errorMessage}`
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