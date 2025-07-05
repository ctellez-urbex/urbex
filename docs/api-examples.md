# Ejemplos de Uso de APIs con API Key

Este documento muestra ejemplos prácticos de cómo usar las APIs con autenticación por API key.

## Configuración Inicial

Primero, asegúrate de tener las variables de entorno configuradas en tu archivo `.env.local`:

```bash
API_KEY=tu_api_key_principal_aqui
ADMIN_API_KEY=tu_api_key_admin_aqui
PUBLIC_API_KEY=tu_api_key_publica_aqui
```

## Generar API Keys

Puedes usar el script incluido para generar API keys seguras:

```bash
# Generar 3 API keys para desarrollo
node scripts/generate-api-keys.js

# Generar API keys para producción
node scripts/generate-api-keys.js --env=production

# Generar 5 API keys personalizadas
node scripts/generate-api-keys.js --count=5
```

## Ejemplos de Uso

### 1. Health Check (Sin Autenticación)

```bash
# GET - Health check (no requiere API key)
curl -X GET http://localhost:3000/api-backup/health

# Respuesta esperada:
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 1234.56,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "api": "operational",
      "database": "operational",
      "email": "configured",
      "cognito": "configured"
    }
  },
  "message": "Servidor funcionando correctamente"
}
```

### 2. Formulario de Contacto (Con API Key)

```bash
# POST - Enviar formulario de contacto
curl -X POST http://localhost:3000/api-backup/contact \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu_api_key_principal_aqui" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "123456789",
    "message": "Hola, me interesa conocer más sobre sus servicios."
  }'

# Respuesta exitosa:
{
  "success": true,
  "data": {
    "id": "msg_123456789",
    "message": "Queued. Thank you."
  },
  "message": "Mensaje enviado exitosamente"
}

# Respuesta de error (sin API key):
{
  "success": false,
  "error": "No autorizado",
  "message": "API key requerida. Por favor proporciona la API key en el header 'x-api-key'",
  "code": "API_KEY_REQUIRED"
}
```

### 3. APIs de Autenticación

```bash
# POST - Confirmar registro de usuario
curl -X POST http://localhost:3000/api-backup/auth/confirm-signup \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu_api_key_principal_aqui" \
  -d '{
    "email": "usuario@example.com",
    "code": "123456"
  }'

# Respuesta exitosa:
{
  "success": true,
  "message": "Email verificado exitosamente. Por favor espera la aprobación del administrador para acceder a tu cuenta."
}
```

### 4. APIs de Administración (Requiere ADMIN_API_KEY)

```bash
# GET - Listar usuarios (requiere API key de administrador)
curl -X GET http://localhost:3000/api-backup/admin/users \
  -H "x-api-key: tu_api_key_admin_aqui"

# Respuesta exitosa:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "email": "usuario@example.com",
        "status": "CONFIRMED",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}

# Respuesta de error (API key incorrecta):
{
  "success": false,
  "error": "No autorizado",
  "message": "API key inválida proporcionada en el header",
  "code": "API_KEY_REQUIRED"
}
```

### 5. Usando Parámetros de Query (Opcional)

```bash
# POST - Con API key en parámetro de query
curl -X POST "http://localhost:3000/api-backup/contact?api_key=tu_api_key_principal_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "987654321",
    "message": "Consulta sobre servicios inmobiliarios."
  }'
```

## Ejemplos con JavaScript/Fetch

### Cliente JavaScript

```javascript
// Configuración
const API_BASE_URL = 'http://localhost:3000/api-backup';
const API_KEY = 'tu_api_key_principal_aqui';

// Función helper para hacer peticiones
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error en API request:', error);
    throw error;
  }
}

// Ejemplos de uso
async function examples() {
  try {
    // Health check
    const health = await fetch(`${API_BASE_URL}/health`);
    console.log('Health check:', await health.json());
    
    // Enviar formulario de contacto
    const contact = await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ana López',
        email: 'ana@example.com',
        phone: '555123456',
        message: 'Me interesa conocer más sobre sus servicios.'
      })
    });
    console.log('Contacto enviado:', contact);
    
    // Confirmar registro
    const confirmSignup = await apiRequest('/auth/confirm-signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nuevo@example.com',
        code: '123456'
      })
    });
    console.log('Registro confirmado:', confirmSignup);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar ejemplos
examples();
```

### Cliente Node.js

```javascript
const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api-backup';
const API_KEY = 'tu_api_key_principal_aqui';

// Cliente HTTP configurado
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Ejemplos de uso
async function nodeExamples() {
  try {
    // Health check
    const health = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', health.data);
    
    // Enviar formulario de contacto
    const contact = await apiClient.post('/contact', {
      name: 'Carlos Ruiz',
      email: 'carlos@example.com',
      phone: '777888999',
      message: 'Consulta sobre análisis inmobiliario.'
    });
    console.log('Contacto enviado:', contact.data);
    
    // APIs de administración (con API key de admin)
    const adminClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'tu_api_key_admin_aqui'
      }
    });
    
    const users = await adminClient.get('/admin/users');
    console.log('Usuarios:', users.data);
    
  } catch (error) {
    if (error.response) {
      console.error('Error de API:', error.response.data);
    } else {
      console.error('Error de red:', error.message);
    }
  }
}

// Ejecutar ejemplos
nodeExamples();
```

## Testing con Postman

### Configuración en Postman

1. **Crear una Collection** para tu proyecto
2. **Agregar una variable de entorno** llamada `api_key` con tu API key
3. **Configurar el header** `x-api-key` con el valor `{{api_key}}`

### Headers Comunes

```
Content-Type: application/json
x-api-key: {{api_key}}
```

### Variables de Entorno en Postman

```
api_key: tu_api_key_principal_aqui
admin_api_key: tu_api_key_admin_aqui
base_url: http://localhost:3000/api-backup
```

## Troubleshooting

### Error: "API key not configured"
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor de desarrollo
- Verifica que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Invalid API key"
- Verifica que estés enviando la API key correcta
- Asegúrate de que no haya espacios extra en la clave
- Verifica que el header `x-api-key` esté bien escrito

### Error: "API key required"
- Asegúrate de incluir el header `x-api-key` en tu petición
- Verifica que la ruta no esté configurada como pública
- Para rutas de admin, usa `ADMIN_API_KEY` en lugar de `API_KEY`

### Logs de Debugging

El sistema registra automáticamente todas las peticiones. Puedes ver los logs en:

- **Desarrollo**: Consola del servidor de desarrollo
- **Producción**: Logs de la plataforma de despliegue

Los logs incluyen:
- Headers de la petición
- Errores de autenticación
- Respuestas de la API
- Timestamps 