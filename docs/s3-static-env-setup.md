# Configuración de Variables de Entorno para S3 + CloudFront

Este documento explica cómo configurar las variables de entorno para un frontend estático desplegado en S3 + CloudFront con APIs externas.

## 🔍 **Problema Específico**

Tu aplicación está desplegada en **S3 + CloudFront** (contenido estático) y necesita comunicarse con **APIs externas**. Las variables de entorno de Next.js no funcionan en contenido estático porque:

1. **S3 sirve archivos estáticos** (HTML, CSS, JS)
2. **No hay servidor Node.js** para procesar variables de entorno
3. **Las variables deben estar disponibles en el cliente** (navegador)

## 🚀 **Solución: Archivo de Configuración Estático**

### **Enfoque Implementado**

1. **Archivo `public/env.js`**: Configuración estática cargada por el frontend
2. **Script de generación**: Crea el archivo durante el build
3. **Carga automática**: Se incluye en el HTML antes de cualquier script
4. **Validación**: Verifica que las variables estén configuradas correctamente

### **Flujo de Funcionamiento**

```
1. Build Time: npm run build
   ↓
2. Generate env.js: node scripts/generate-env-js.js --env=production
   ↓
3. Create /public/env.js with configuration
   ↓
4. Next.js build includes env.js in static files
   ↓
5. Deploy to S3 + CloudFront
   ↓
6. Browser loads env.js first
   ↓
7. Frontend uses window.ENV for API calls
```

## ⚠️ **Problema Resuelto: Preservación de Credenciales en Desarrollo**

**Problema anterior:** Al ejecutar `npm run dev`, el script `generate-env-js.js` sobrescribía las credenciales guardadas en `env.js` con valores por defecto.

**Solución implementada:** El script ahora preserva automáticamente las credenciales existentes mediante:

1. **Carga inteligente**: Lee el archivo `env.js` existente antes de generar uno nuevo
2. **Fusión selectiva**: Mantiene credenciales reales y solo actualiza valores por defecto
3. **Detección de valores**: Identifica automáticamente valores placeholder (`dev_`, `your_`, `tu_`, `http://localhost:3001`)

**Resultado:** Ahora puedes ejecutar `npm run dev` sin perder tus credenciales configuradas.

## 🔧 **Configuración**

### **1. Generar Configuración para Producción**

```bash
# Generar env.js para producción
npm run env:generate -- --env=production

# O directamente
node scripts/generate-env-js.js --env=production
```

### **2. Editar el Archivo Generado**

El script genera `/public/env.js` con valores por defecto. **Edita este archivo** con tus valores reales:

```javascript
// /public/env.js
window.ENV = {
  // API Externa Configuration
  NEXT_PUBLIC_API_BASE_URL: 'https://api.urbex.com.co',
  NEXT_PUBLIC_API_KEY: 'tu_api_key_real_aqui',
  
  // AWS Configuration
  NEXT_PUBLIC_AWS_REGION: 'us-east-2',
  NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
  NEXT_PUBLIC_AWS_POOL_CLIENT_ID: 'tu_cognito_client_id_real',
  
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: 'Urbex',
  NEXT_PUBLIC_APP_URL: 'https://urbex.com.co',
  
  // Environment
  NODE_ENV: 'production'
};
```

### **3. Configuración por Ambiente**

#### **Desarrollo Local**
```bash
npm run env:generate -- --env=development
```

#### **Staging**
```bash
npm run env:generate -- --env=staging
```

#### **Producción**
```bash
npm run env:generate -- --env=production
```

## 🚀 **Despliegue**

### **Opción 1: Despliegue Manual**

1. **Genera la configuración**:
   ```bash
   npm run env:generate -- --env=production
   ```

2. **Edita `/public/env.js`** con tus valores reales

3. **Construye la aplicación**:
   ```bash
   npm run build
   ```

4. **Sube a S3**:
   ```bash
   npm run deploy
   ```

### **Opción 2: CI/CD con GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate environment configuration
        run: npm run env:generate -- --env=production
        
      - name: Edit env.js with secrets
        run: |
          # Replace placeholder values with GitHub secrets
          sed -i 's/your_api_key_here/${{ secrets.API_KEY }}/g' public/env.js
          sed -i 's/tu_cognito_client_id_real/${{ secrets.COGNITO_CLIENT_ID }}/g' public/env.js
          
      - name: Build application
        run: npm run build
        
      - name: Deploy to S3
        run: npm run deploy
```

### **Opción 3: AWS Amplify**

El archivo `amplify.yml` ya está configurado para generar automáticamente el archivo env.js:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - echo "Generating environment configuration for static frontend..."
        - npm run env:generate -- --env=production
        - echo "Building Next.js application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

## 🧪 **Verificación**

### **1. Verificar en el Navegador**

Abre las **Developer Tools** (F12) y revisa la **Console**:

```javascript
// Deberías ver:
🔧 Environment loaded: {NEXT_PUBLIC_API_BASE_URL: "https://api.urbex.com.co", ...}
✅ All environment variables are properly configured
🔗 API Configuration: {baseUrl: "https://api.urbex.com.co", hasApiKey: true, ...}
```

### **2. Verificar Variables**

En la consola del navegador:

```javascript
// Verificar que las variables estén disponibles
console.log('API Base URL:', window.ENV.NEXT_PUBLIC_API_BASE_URL);
console.log('API Key configured:', !!window.ENV.NEXT_PUBLIC_API_KEY);
console.log('AWS Region:', window.ENV.NEXT_PUBLIC_AWS_REGION);
```

### **3. Probar API**

```javascript
// Probar llamada a la API
fetch(`${window.ENV.NEXT_PUBLIC_API_BASE_URL}/health`)
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));
```

## 🚨 **Troubleshooting**

### **Error: "window.ENV is undefined"**
- Verifica que `/public/env.js` se esté cargando
- Revisa que el script esté incluido en el HTML
- Asegúrate de que el archivo se haya generado correctamente

### **Error: "API calls failing"**
- Verifica que la URL de la API sea correcta
- Asegúrate de que la API key sea válida
- Revisa que la API externa esté funcionando

### **Error: "Variables not updating"**
- Regenera el archivo env.js: `npm run env:generate -- --env=production`
- Edita manualmente `/public/env.js`
- Redespliega la aplicación

### **Error: "Build failing"**
- Verifica que el script `generate-env-js.js` esté ejecutándose
- Revisa los logs de build
- Asegúrate de que la carpeta `/public` exista

## 🔒 **Seguridad**

### **Consideraciones Importantes**

1. **Las variables son visibles en el cliente** (navegador)
2. **Solo usa variables públicas** (NEXT_PUBLIC_*)
3. **Nunca incluyas secretos** en el frontend
4. **Usa HTTPS** en producción
5. **Valida las API keys** en el servidor

### **Mejores Prácticas**

- **Rota las API keys** regularmente
- **Monitorea el uso** de las APIs
- **Usa rate limiting** en el servidor
- **Valida todas las peticiones** en el backend
- **Usa CORS** apropiadamente

## 📝 **Scripts Útiles**

```bash
# Generar configuración para diferentes ambientes
npm run env:generate -- --env=development
npm run env:generate -- --env=staging
npm run env:generate -- --env=production

# Verificar configuración
npm run env:check

# Build con configuración automática
npm run build:dev      # development
npm run build:staging  # staging
npm run build          # production
```

## 📞 **Soporte**

Si tienes problemas:

1. **Verifica que `/public/env.js` se haya generado**
2. **Revisa la consola del navegador** para errores
3. **Confirma que las variables tengan valores reales**
4. **Prueba las APIs externas** directamente
5. **Revisa los logs de despliegue**

¿Necesitas ayuda con algún paso específico? 