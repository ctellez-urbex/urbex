# Clean Routing Guide

## Descripción General

Este sistema implementa **URLs limpias** sin `index.html` que funcionan consistentemente en todos los entornos (local, desarrollo y producción) siguiendo las normas de S3 static hosting.

## Características

✅ **URLs Limpias**: `/dashboard` en lugar de `/dashboard/index.html`  
✅ **Compatibilidad S3**: Funciona perfectamente con S3 static website hosting  
✅ **SPA Routing**: Soporte completo para Single Page Application routing  
✅ **Multi-entorno**: Configuración consistente para local, dev y prod  
✅ **Cache Optimizado**: Headers de cache apropiados para cada tipo de archivo  

## Arquitectura

### 1. Next.js Configuration (`next.config.js`)
```javascript
{
  output: 'export',           // Static export para S3
  trailingSlash: false,       // URLs limpias sin /
  skipTrailingSlashRedirect: true
}
```

### 2. S3 Website Configuration
```json
{
  "IndexDocument": { "Suffix": "index.html" },
  "ErrorDocument": { "Key": "index.html" }
}
```

### 3. Local Development Server
- Express.js server que simula comportamiento de S3
- Routing inteligente con fallback a SPA
- Cache headers apropiados

## Estructura de URLs

| Ruta Limpia | Archivo Físico | Descripción |
|-------------|----------------|-------------|
| `/` | `/index.html` | Página principal |
| `/dashboard` | `/dashboard/index.html` | Dashboard |
| `/properties` | `/properties/index.html` | Propiedades |
| `/auth/login` | `/auth/login/index.html` | Login |
| `/auth/register` | `/auth/register/index.html` | Registro |

## Scripts Disponibles

### Setup y Configuración
```bash
# Configurar routing limpio (ejecutar una vez)
npm run setup:clean-routing
```

### Desarrollo Local
```bash
# Desarrollo normal con Next.js
npm run dev

# Servidor de desarrollo con routing limpio
npm run serve:clean
```

### Build y Testing
```bash
# Build para producción
npm run build

# Test routing localmente
npm run test:routing
```

### Deployment
```bash
# Deploy a S3 con routing limpio
npm run deploy:s3-clean

# Deploy tradicional
npm run deploy:s3
```

## Flujo de Trabajo

### 1. Configuración Inicial
```bash
# Configurar routing limpio
npm run setup:clean-routing

# Verificar archivos generados
ls -la next.config.js vercel.json s3-website-config.json
```

### 2. Desarrollo Local
```bash
# Opción 1: Desarrollo normal
npm run dev
# Acceder: http://localhost:3000

# Opción 2: Simular S3 routing
npm run build
npm run serve:clean
# Acceder: http://localhost:3001
```

### 3. Testing
```bash
# Test completo de routing
npm run test:routing

# Verificar URLs limpias:
# http://localhost:3001/
# http://localhost:3001/dashboard
# http://localhost:3001/properties
# http://localhost:3001/auth/login
```

### 4. Deployment a Producción
```bash
# Deploy con routing limpio
npm run deploy:s3-clean

# Verificar en producción:
# https://urbex.com.co/
# https://urbex.com.co/dashboard
# https://urbex.com.co/properties
```

## Configuración de Entornos

### Variables de Entorno Requeridas
```bash
# S3 Configuration
S3_BUCKET_NAME=urbex-frontend
AWS_REGION=us-east-2
CF_DISTRIBUTION_ID=E1234567890ABC

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Archivos de Configuración

#### `next.config.js`
- Configuración de Next.js para export estático
- URLs limpias sin trailing slash
- Optimizaciones de performance

#### `vercel.json`
- Configuración para Vercel deployment
- Clean URLs habilitadas
- Headers de cache optimizados

#### `s3-website-config.json`
- Configuración específica para S3 website hosting
- Error document apunta a index.html para SPA routing

## Troubleshooting

### Problema: 404 en rutas directas
**Solución**: Verificar que S3 esté configurado con `ErrorDocument: index.html`

### Problema: URLs muestran index.html
**Solución**: Verificar `trailingSlash: false` en `next.config.js`

### Problema: Assets no cargan
**Solución**: Verificar `assetPrefix` y `basePath` en configuración

### Problema: Cache no funciona
**Solución**: Verificar headers de cache en deployment script

## Monitoreo y Logs

### Development Server Logs
```bash
# Ver logs del servidor de desarrollo
npm run serve:clean

# Output esperado:
# 🚀 Clean Routing Server running on http://localhost:3001
# 📁 Serving files from: /path/to/out
# 🎯 Serving clean route: /dashboard -> /dashboard/index.html
# 🔄 SPA fallback for: /some/route
```

### S3 Deployment Logs
```bash
# Ver logs de deployment
npm run deploy:s3-clean

# Output esperado:
# 🚀 Starting S3 Clean Routing Deployment...
# ✅ Build completed
# ✅ S3 website configuration applied
# ✅ Files uploaded to S3
# ✅ CloudFront invalidation started
```

## Mejores Prácticas

### 1. Desarrollo
- Usar `npm run dev` para desarrollo rápido
- Usar `npm run serve:clean` para testing de routing
- Siempre hacer `npm run build` antes de deployment

### 2. Testing
- Probar todas las rutas principales manualmente
- Verificar que el refresh funcione en cada ruta
- Comprobar que los assets se cargan correctamente

### 3. Deployment
- Usar `npm run deploy:s3-clean` para producción
- Verificar invalidación de CloudFront
- Monitorear logs de deployment

### 4. Mantenimiento
- Revisar configuración después de updates de Next.js
- Mantener sincronizados los archivos de configuración
- Documentar cambios en routing

## Compatibilidad

| Entorno | Soporte | Notas |
|---------|---------|-------|
| Next.js Dev | ✅ | Routing nativo |
| Local Server | ✅ | Simula S3 behavior |
| S3 Static | ✅ | Configuración optimizada |
| CloudFront | ✅ | Cache y CDN |
| Vercel | ✅ | Deploy alternativo |

## Recursos Adicionales

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Custom Error Pages](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/custom-error-pages.html)
