import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyFromEnv, API_KEY_ENV_VARS } from './api-auth';

/**
 * Utilidades para Rutas de API
 * 
 * Este módulo proporciona funciones de utilidad para los manejadores de rutas de API
 * para validar fácilmente API keys y manejar patrones comunes de respuesta.
 */

export interface ApiRouteConfig {
  /** El tipo de API key requerida para esta ruta */
  apiKeyType?: keyof typeof API_KEY_ENV_VARS;
  /** Si permite API key en parámetros de query */
  allowQueryParam?: boolean;
  /** Nombre personalizado del header para API key */
  headerName?: string;
  /** Nombre personalizado del parámetro query para API key */
  queryParamName?: string;
  /** Si omitir validación de API key (para endpoints públicos) */
  skipAuth?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Valida API key para un manejador de ruta
 * 
 * @param request - El objeto NextRequest
 * @param config - Configuración para validación de API key
 * @returns NextResponse con error si la validación falla, null si es exitosa
 */
export function validateApiKeyForRoute(
  request: NextRequest,
  config: ApiRouteConfig = {}
): NextResponse | null {
  const { skipAuth = false, apiKeyType = 'API_KEY', ...options } = config;
  
  // Omitir validación si está explícitamente deshabilitada
  if (skipAuth) {
    return null;
  }
  
  // Validar API key
  const validation = validateApiKeyFromEnv(request, apiKeyType, options);
  
  if (!validation.isValid) {
    console.warn(`Validación de API Key falló: ${validation.error}`);
    
    return NextResponse.json(
      {
        success: false,
        error: 'No autorizado',
        message: validation.error || 'Se requiere autenticación por API key',
        code: 'API_KEY_REQUIRED'
      },
      { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'ApiKey',
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  return null;
}

/**
 * Crea una respuesta de éxito
 * 
 * @param data - Los datos a incluir en la respuesta
 * @param message - Mensaje de éxito opcional
 * @param status - Código de estado HTTP (por defecto: 200)
 * @returns NextResponse con datos de éxito
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    },
    { status }
  );
}

/**
 * Crea una respuesta de error
 * 
 * @param error - Mensaje de error
 * @param code - Código de error opcional
 * @param status - Código de estado HTTP (por defecto: 400)
 * @returns NextResponse con datos de error
 */
export function createErrorResponse(
  error: string,
  code?: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code })
    },
    { status }
  );
}

/**
 * Envuelve un manejador de ruta de API con validación de API key
 * 
 * @param handler - La función manejadora de ruta
 * @param config - Configuración para validación de API key
 * @returns Manejador envuelto con validación de API key
 */
export function withApiKeyAuth<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  config: ApiRouteConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validar API key primero
    const authError = validateApiKeyForRoute(request, config);
    if (authError) {
      return authError;
    }
    
    // Llamar al manejador original
    return handler(request);
  };
}

/**
 * Valida campos requeridos en el cuerpo de la petición
 * 
 * @param body - El objeto del cuerpo de la petición
 * @param requiredFields - Array de nombres de campos requeridos
 * @returns Mensaje de error si la validación falla, null si es exitosa
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      return `El campo '${field}' es requerido`;
    }
  }
  return null;
}

/**
 * Valida formato de email
 * 
 * @param email - String de email a validar
 * @returns Si el formato de email es válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Registra información de petición de API para debugging
 * 
 * @param request - El objeto NextRequest
 * @param routeName - Nombre de la ruta para logging
 */
export function logApiRequest(request: NextRequest, routeName: string): void {
  console.log(`🔐 Petición API: ${routeName}`, {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });
}

/**
 * Registra información de respuesta de API para debugging
 * 
 * @param response - El objeto NextResponse
 * @param routeName - Nombre de la ruta para logging
 */
export function logApiResponse(response: NextResponse, routeName: string): void {
  console.log(`✅ Respuesta API: ${routeName}`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    timestamp: new Date().toISOString()
  });
} 