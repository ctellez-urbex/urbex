import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyFromEnv, API_KEY_ENV_VARS } from './lib/api-auth';

/**
 * Next.js Middleware para Autenticación por API Key
 * 
 * Este middleware valida API keys para todas las rutas de API.
 * Soporta diferentes API keys para diferentes patrones de rutas:
 * - Rutas de admin: ADMIN_API_KEY
 * - Rutas públicas: PUBLIC_API_KEY (opcional)
 * - Todas las demás rutas de API: API_KEY
 */

// Definir patrones de rutas que requieren diferentes API keys
const ADMIN_ROUTES = [
  '/api/admin',
  '/api-backup/admin'
];

const PUBLIC_ROUTES = [
  '/api/public',
  '/api-backup/public'
];

const AUTH_ROUTES = [
  '/api/auth',
  '/api-backup/auth'
];

/**
 * Determina qué API key usar basado en la ruta de la petición
 * 
 * @param pathname - El pathname de la petición
 * @returns El nombre de la variable de entorno para la API key apropiada
 */
function getApiKeyForRoute(pathname: string): keyof typeof API_KEY_ENV_VARS {
  // Verificar rutas de admin primero
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return 'ADMIN_API_KEY';
  }
  
  // Verificar rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return 'PUBLIC_API_KEY';
  }
  
  // Verificar rutas de auth (usar API key principal)
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return 'API_KEY';
  }
  
  // Por defecto usar API key principal para todas las demás rutas de API
  return 'API_KEY';
}

/**
 * Verifica si una ruta debe estar protegida por autenticación de API key
 * 
 * @param pathname - El pathname de la petición
 * @returns Si la ruta debe estar protegida
 */
function shouldProtectRoute(pathname: string): boolean {
  // Proteger todas las rutas de API
  return pathname.startsWith('/api') || pathname.startsWith('/api-backup');
}

/**
 * Verifica si una ruta debe ser omitida para la validación de API key
 * 
 * @param pathname - El pathname de la petición
 * @returns Si la ruta debe ser omitida
 */
function shouldSkipApiKeyValidation(pathname: string): boolean {
  // Omitir endpoints de health check
  if (pathname === '/api/health' || pathname === '/api-backup/health') {
    return true;
  }
  
  // Omitir endpoints de documentación
  if (pathname.startsWith('/api/docs') || pathname.startsWith('/api-backup/docs')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Solo aplicar a rutas de API
  if (!shouldProtectRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Omitir validación de API key para ciertos endpoints
  if (shouldSkipApiKeyValidation(pathname)) {
    return NextResponse.next();
  }
  
  // Determinar qué API key usar para esta ruta
  const apiKeyType = getApiKeyForRoute(pathname);
  
  // Validar API key
  const validation = validateApiKeyFromEnv(request, apiKeyType);
  
  if (!validation.isValid) {
    console.warn(`Validación de API Key falló para ${pathname}: ${validation.error}`);
    
    return NextResponse.json(
      {
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
  
  // Agregar tipo de API key a headers para uso posterior
  const response = NextResponse.next();
  response.headers.set('x-api-key-type', apiKeyType);
  
  return response;
}

/**
 * Configurar en qué paths debe ejecutarse el middleware
 */
export const config = {
  matcher: [
    /*
     * Coincidir con todos los paths de petición excepto los que empiecen con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo favicon)
     * - carpeta public
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 