/**
 * Authentication API Configuration
 * 
 * Handles all authentication-related API calls including:
 * - User login/logout
 * - User registration
 * - Email verification
 * - Password reset
 * - User profile management
 */

import { apiRequest, API_CONFIG } from './api';

// Types for authentication
export interface LoginCredentials {
  email: string;
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
 * User login function
 * 
 * @param credentials - User login credentials
 * @returns Promise with login response
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Modo desarrollo: simular login exitoso
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEV MODE: Simulating login for:', credentials.email);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validación básica
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email y contraseña son requeridos'
        };
      }
      
      if (credentials.password.length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }
      
      // Simular respuesta exitosa
      return {
        success: true,
        data: {
          user: {
            email: credentials.email,
            first_name: credentials.email.split('@')[0],
            last_name: 'Usuario',
            phone_number: '+57-300-000-0000',
            su: 'user',
            plan: 'basic',
            name: credentials.email.split('@')[0]
          },
          token: 'dev_token_' + Date.now()
        }
      };
    }
    
    // Modo producción: usar API real
    const response = await apiRequest<LoginResponse>('/auth/login', {
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
 * User registration function
 * 
 * @param userData - User registration data
 * @returns Promise with registration response
 */
export async function registerUser(userData: RegisterData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email.trim(),
        password: userData.password,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        phone_number: userData.phone_number.trim(),
        plan: userData.plan,
        su: userData.su || '1'
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
 * Email verification function
 * 
 * @param verifyData - Email verification data
 * @returns Promise with verification response
 */
export async function verifyEmail(verifyData: VerifyEmailData) {
  try {
    const response = await apiRequest('/auth/confirm', {
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
 * Resend verification code function
 * 
 * @param resendData - Data for resending code
 * @returns Promise with response
 */
export async function resendVerificationCode(resendData: ResendCodeData) {
  try {
    const response = await apiRequest('/auth/register', {
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
 * Forgot password function
 * 
 * @param forgotData - Forgot password data
 * @param token - Optional token
 * @returns Promise with response
 */
export async function forgotPassword(forgotData: ForgotPasswordData, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await apiRequest('/auth/forgot-password', {
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
      error: error instanceof Error ? error.message : 'Error durante el proceso de recuperación'
    };
  }
}

/**
 * Reset password function
 * 
 * @param resetData - Reset password data
 * @param token - Optional token
 * @returns Promise with response
 */
export async function resetPassword(resetData: ResetPasswordData, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await apiRequest('/auth/reset-password', {
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
 * Get user profile function
 * 
 * @param token - Authentication token
 * @returns Promise with user profile data
 */
export async function getUserProfile(token: string) {
  try {
    const response = await apiRequest('/auth/me', {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
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