# Configuración de API Keys

Este documento explica cómo configurar la autenticación por API key en el proyecto Urbex.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# API Keys Configuration
# =====================

# API Key principal para acceso general a las APIs
# Esta es la clave que se usará para la mayoría de endpoints
API_KEY=your_main_api_key_here

# API Key de administrador para endpoints administrativos
# Esta clave tiene acceso a funciones administrativas
ADMIN_API_KEY=your_admin_api_key_here

# API Key pública para endpoints públicos (opcional)
# Esta clave se usa para endpoints que necesitan ser accesibles públicamente
# Si no se configura, se usará la API_KEY principal
PUBLIC_API_KEY=your_public_api_key_here
```

## Generación de API Keys Seguras

### Opción 1: Usando OpenSSL
```bash
openssl rand -hex 32
```

### Opción 2: Usando Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opción 3: Usando un generador online
- Visita https://generate-secret.vercel.app/32
- Copia la clave generada

## Niveles de Acceso

### 1. API_KEY (Principal)
- **Uso**: Acceso general a la mayoría de endpoints
- **Rutas**: `/api/*`, `/api-backup/*` (excepto admin)
- **Ejemplo**: Endpoints de contacto, autenticación, etc.

### 2. ADMIN_API_KEY (Administrador)
- **Uso**: Funciones administrativas y de gestión
- **Rutas**: `/api/admin/*`, `/api-backup/admin/*`
- **Ejemplo**: Gestión de usuarios, configuración del sistema

### 3. PUBLIC_API_KEY (Pública - Opcional)
- **Uso**: Endpoints que necesitan ser accesibles públicamente
- **Rutas**: `/api/public/*`, `/api-backup/public/*`
- **Ejemplo**: Health checks, información pública

## Cómo Usar las API Keys

### En Headers (Recomendado)
```bash
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"name": "Test", "email": "test@example.com", "phone": "123456789", "message": "Hello"}'
```

### En Parámetros de Query (Opcional)
```bash
curl -X POST "https://your-domain.com/api/contact?api_key=your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com", "phone": "123456789", "message": "Hello"}'
```

## Implementación en Código

### Middleware Automático
El middleware de Next.js valida automáticamente las API keys para todas las rutas de API:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // La validación se ejecuta automáticamente
  // No necesitas hacer nada más en tus rutas
}
```

### Validación Manual en Rutas
Si necesitas validación manual en una ruta específica:

```typescript
import { validateApiKeyForRoute, createSuccessResponse, createErrorResponse } from '../../lib/api-utils';

export async function POST(request: NextRequest) {
  // Validar API key
  const authError = validateApiKeyForRoute(request, { 
    apiKeyType: 'API_KEY' // o 'ADMIN_API_KEY', 'PUBLIC_API_KEY'
  });
  
  if (authError) {
    return authError;
  }
  
  // Tu lógica de la API aquí
  return createSuccessResponse({ message: 'Success' });
}
```

### Rutas Públicas
Para hacer una ruta pública (sin autenticación):

```typescript
export async function GET(request: NextRequest) {
  // Omitir validación de API key
  const authError = validateApiKeyForRoute(request, { 
    skipAuth: true
  });
  
  // Tu lógica de la API aquí
  return createSuccessResponse({ message: 'Public endpoint' });
}
```

## Seguridad

### Mejores Prácticas
1. **Nunca** commits las API keys al repositorio
2. Usa claves diferentes para diferentes entornos (desarrollo, staging, producción)
3. Rota las claves regularmente
4. Usa HTTPS en producción
5. Limita el acceso por IP si es posible

### Variables de Entorno por Entorno

#### Desarrollo (.env.local)
```bash
API_KEY=dev_api_key_123
ADMIN_API_KEY=dev_admin_key_456
```

#### Staging (.env.staging)
```bash
API_KEY=staging_api_key_789
ADMIN_API_KEY=staging_admin_key_012
```

#### Producción (.env.production)
```bash
API_KEY=prod_api_key_345
ADMIN_API_KEY=prod_admin_key_678
```

## Troubleshooting

### Error: "API key not configured"
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Error: "Invalid API key"
- Verifica que estés enviando la API key correcta
- Asegúrate de que el header `x-api-key` esté bien escrito
- Verifica que no haya espacios extra en la clave

### Error: "API key required"
- Asegúrate de incluir el header `x-api-key` en tu petición
- Verifica que la ruta no esté configurada como pública

## Logs y Debugging

El sistema registra automáticamente:
- Peticiones de API con headers
- Errores de autenticación
- Respuestas de API

Puedes ver los logs en la consola del servidor de desarrollo o en los logs de producción. 