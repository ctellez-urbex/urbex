# Configuración de Variables de Entorno para Frontend

Este documento explica cómo configurar las variables de entorno necesarias para que el frontend (S3 + CloudFront) pueda comunicarse con las APIs externas.

## 🔍 **Problema Identificado**

Tu frontend está desplegado en S3 (contenido estático) y necesita comunicarse con APIs externas. Las variables de entorno deben estar disponibles en el frontend usando el prefijo `NEXT_PUBLIC_*`.

## 📋 **Variables de Entorno Requeridas**

### **Para el Frontend (.env.local)**

```bash
# API Externa Configuration
# ========================

# URL base de la API externa
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co

# API Key para autenticación con la API externa
NEXT_PUBLIC_API_KEY=tu_api_key_externa_aqui

# Configuración de AWS Cognito (para autenticación)
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=tu_cognito_client_id

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Urbex
NEXT_PUBLIC_APP_URL=https://urbex.com.co
```

### **Para el Backend (API Externa)**

```bash
# API Keys para diferentes niveles de acceso
API_KEY=tu_api_key_principal_aqui
ADMIN_API_KEY=tu_api_key_admin_aqui
PUBLIC_API_KEY=tu_api_key_publica_aqui

# AWS Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
AWS_POOL_CLIENT_ID=tu_cognito_client_id

# Mailgun Configuration
MAILGUN_API_KEY=tu_mailgun_api_key
MAILGUN_DOMAIN=tu_mailgun_domain
CONTACT_EMAIL=contact@urbex.com.co
```

## 🚀 **Configuración por Entorno**

### **Desarrollo Local**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev_api_key_123
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=dev_client_id
```

### **Staging**

```bash
# .env.staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.urbex.com.co
NEXT_PUBLIC_API_KEY=staging_api_key_456
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=staging_client_id
```

### **Producción**

```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co
NEXT_PUBLIC_API_KEY=prod_api_key_789
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=prod_client_id
```

## 🔧 **Configuración en AWS Amplify**

Si estás usando AWS Amplify para el despliegue:

1. **Ve al dashboard de Amplify**
2. **Selecciona tu aplicación**
3. **Ve a Environment variables**
4. **Agrega las variables:**

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co
NEXT_PUBLIC_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=tu_client_id
```

## 🔧 **Configuración en Vercel**

Si estás usando Vercel:

1. **Ve al dashboard de Vercel**
2. **Selecciona tu proyecto**
3. **Ve a Settings → Environment Variables**
4. **Agrega las variables:**

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co
NEXT_PUBLIC_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=tu_client_id
```

## 🔧 **Configuración Manual en S3**

Si estás desplegando manualmente en S3:

1. **Crea un archivo `env.js` en la carpeta `public/`:**

```javascript
// public/env.js
window.ENV = {
  NEXT_PUBLIC_API_BASE_URL: 'https://api.urbex.com.co',
  NEXT_PUBLIC_API_KEY: 'tu_api_key_aqui',
  NEXT_PUBLIC_AWS_REGION: 'us-east-2',
  NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
  NEXT_PUBLIC_AWS_POOL_CLIENT_ID: 'tu_client_id'
};
```

2. **Incluye el script en tu `_document.tsx`:**

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <script src="/env.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

3. **Actualiza la configuración de API:**

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: (typeof window !== 'undefined' && window.ENV?.NEXT_PUBLIC_API_BASE_URL) || 
            process.env.NEXT_PUBLIC_API_BASE_URL || 
            'https://api.urbex.com.co',
  
  API_KEY: (typeof window !== 'undefined' && window.ENV?.NEXT_PUBLIC_API_KEY) || 
           process.env.NEXT_PUBLIC_API_KEY || 
           '',
  // ... resto de la configuración
};
```

## 🧪 **Testing de la Configuración**

### **Verificar Variables de Entorno**

```javascript
// En la consola del navegador
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('API Key:', process.env.NEXT_PUBLIC_API_KEY ? 'Configurada' : 'No configurada');
```

### **Probar API de Contacto**

```javascript
// En la consola del navegador
fetch('/api-backup/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789',
    message: 'Test message'
  })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));
```

## 🔒 **Seguridad**

### **Variables Públicas vs Privadas**

- **NEXT_PUBLIC_***: Disponibles en el frontend (públicas)
- **Sin prefijo**: Solo disponibles en el servidor (privadas)

### **Mejores Prácticas**

1. **Nunca** expongas claves secretas en el frontend
2. Usa **NEXT_PUBLIC_** solo para configuraciones públicas
3. **Rota las API keys** regularmente
4. **Usa HTTPS** en producción
5. **Valida las API keys** en el servidor

### **API Key Segura**

```bash
# Generar API key segura
node scripts/generate-api-keys.js --env=production
```

## 🚨 **Troubleshooting**

### **Error: "API key not configured"**
- Verifica que `NEXT_PUBLIC_API_KEY` esté configurada
- Asegúrate de que la variable esté disponible en el frontend
- Reinicia el servidor de desarrollo

### **Error: "Failed to fetch"**
- Verifica que `NEXT_PUBLIC_API_BASE_URL` sea correcta
- Asegúrate de que la API externa esté funcionando
- Verifica la conectividad de red

### **Error: "CORS"**
- Verifica que la API externa tenga CORS configurado
- Asegúrate de que el dominio del frontend esté permitido

### **Variables no se cargan**
- Verifica que las variables tengan el prefijo `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo
- Limpia la caché del navegador

## 📝 **Próximos Pasos**

1. **Configura las variables de entorno** según tu entorno
2. **Despliega el frontend** con las nuevas variables
3. **Prueba el formulario de contacto**
4. **Verifica que las APIs funcionen** correctamente
5. **Monitorea los logs** para detectar errores

¿Necesitas ayuda con alguna configuración específica? 