/**
 * API Key Authentication Utility
 * 
 * Este módulo proporciona utilidades para validar API keys en las rutas de API.
 * Soporta autenticación por headers y parámetros de query.
 */

export interface ApiKeyConfig {
  /** La API key para validar */
  apiKey: string;
  /** Si permite API key en parámetros de query (por defecto: false) */
  allowQueryParam?: boolean;
  /** Nombre personalizado del header para API key (por defecto: 'x-api-key') */
  headerName?: string;
  /** Nombre personalizado del parámetro query para API key (por defecto: 'api_key') */
  queryParamName?: string;
}

export interface ApiKeyValidationResult {
  /** Si la API key es válida */
  isValid: boolean;
  /** Mensaje de error si la validación falló */
  error?: string;
}

/**
 * Valida una API key desde headers o parámetros de query
 * 
 * @param request - El objeto Request
 * @param config - Configuración para la validación de API key
 * @returns Resultado de validación con estado de éxito y mensaje de error opcional
 */
export function validateApiKey(
  request: Request,
  config: ApiKeyConfig
): ApiKeyValidationResult {
  const {
    apiKey,
    allowQueryParam = false,
    headerName = 'x-api-key',
    queryParamName = 'api_key'
  } = config;

  // Verificar si la API key está configurada
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key no configurada en el servidor'
    };
  }

  // Intentar obtener API key del header primero
  const headerApiKey = request.headers.get(headerName);
  
  if (headerApiKey) {
    if (headerApiKey === apiKey) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'API key inválida proporcionada en el header'
      };
    }
  }

  // Intentar parámetro de query si está permitido
  if (allowQueryParam) {
    const url = new URL(request.url);
    const queryApiKey = url.searchParams.get(queryParamName);
    
    if (queryApiKey) {
      if (queryApiKey === apiKey) {
        return { isValid: true };
      } else {
        return {
          isValid: false,
          error: 'API key inválida proporcionada en el parámetro de query'
        };
      }
    }
  }

  // No se encontró API key
  return {
    isValid: false,
    error: `API key requerida. Por favor proporciona la API key en el header '${headerName}'${allowQueryParam ? ` o como parámetro de query '${queryParamName}'` : ''}`
  };
}

/**
 * Nombres de variables de entorno para configuración de API key
 */
export const API_KEY_ENV_VARS = {
  /** API key principal para acceso general a APIs */
  API_KEY: 'API_KEY',
  /** API key de administrador para endpoints administrativos */
  ADMIN_API_KEY: 'ADMIN_API_KEY',
  /** API key pública para endpoints públicos (opcional) */
  PUBLIC_API_KEY: 'PUBLIC_API_KEY'
} as const;

/**
 * Obtiene API key desde variables de entorno
 * 
 * @param keyName - El nombre de la variable de entorno para la API key
 * @returns El valor de la API key o undefined si no se encuentra
 */
export function getApiKeyFromEnv(keyName: keyof typeof API_KEY_ENV_VARS): string | undefined {
  return process.env[API_KEY_ENV_VARS[keyName]];
}

/**
 * Valida API key usando variable de entorno
 * 
 * @param request - El objeto Request
 * @param envKeyName - El nombre de la variable de entorno para la API key
 * @param options - Opciones adicionales de validación
 * @returns Resultado de validación
 */
export function validateApiKeyFromEnv(
  request: Request,
  envKeyName: keyof typeof API_KEY_ENV_VARS,
  options: Omit<ApiKeyConfig, 'apiKey'> = {}
): ApiKeyValidationResult {
  const apiKey = getApiKeyFromEnv(envKeyName);
  
  if (!apiKey) {
    return {
      isValid: false,
      error: `API key no configurada en variable de entorno: ${API_KEY_ENV_VARS[envKeyName]}`
    };
  }

  return validateApiKey(request, { ...options, apiKey });
} 