# Solución de Routing para S3 + CloudFront

## 🚨 Problema Identificado

**Problema:** Al acceder directamente a rutas como `/dashboard`, `/auth/login`, etc. en S3, se obtiene error 404.

**Causa:** S3 sirve archivos estáticos y no puede manejar routing de SPA (Single Page Application).

## ✅ Solución Completa

### 1. Configuración de S3 Bucket

#### Error Document Configuration
En la configuración del bucket S3:
```json
{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "index.html"
  }
}
```

#### Comando AWS CLI
```bash
aws s3 website s3://tu-bucket-name --index-document index.html --error-document index.html
```

### 2. Configuración de CloudFront

#### Custom Error Pages
En CloudFront Distribution, configurar Custom Error Pages:

```json
{
  "ErrorCode": 404,
  "ResponsePagePath": "/index.html",
  "ResponseCode": "200",
  "ErrorCachingMinTTL": 300
}
```

#### Comando AWS CLI
```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "urbex-spa-routing",
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}'
```

### 3. Configuración de Next.js (Ya implementada)

El archivo `next.config.js` ya tiene la configuración correcta:

```javascript
const nextConfig = {
  output: 'export', // Enable static export for S3 deployment
  distDir: 'out',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // ... otras configuraciones
}
```

### 4. Archivo _redirects (Para Netlify/Vercel como referencia)

El archivo `public/_redirects` está configurado correctamente:

```
# Redirect all requests to index.html
/* /index.html 200

# Handle specific routes
/auth/login /index.html 200
/auth/* /index.html 200
/dashboard/* /index.html 200
```

### 5. Script de Deploy Actualizado

Crear/actualizar el script de deploy para incluir la configuración de S3:

```bash
#!/bin/bash
# deploy-s3-routing.sh

# Build the application
npm run build

# Sync files to S3
aws s3 sync out/ s3://tu-bucket-name --delete

# Configure S3 website
aws s3 website s3://tu-bucket-name --index-document index.html --error-document index.html

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"

echo "✅ Deploy completed with routing fix"
```

## 🧪 Testing

### Local Testing (Simular S3)

```bash
# Build the application
npm run build

# Serve static files (simula S3)
python3 -m http.server 8080 --directory out

# Test routing
curl http://localhost:8080/dashboard  # Should return 404
curl http://localhost:8080/dashboard/ # Should return 404
```

### Con la solución implementada:

```bash
# Usar serve con fallback (simula S3 + CloudFront)
npx serve out -s

# Test routing
curl http://localhost:3000/dashboard  # Should return 200
curl http://localhost:3000/auth/login # Should return 200
```

## 🔧 Implementación Paso a Paso

### Paso 1: Configurar S3 Bucket
```bash
# Configurar website hosting
aws s3 website s3://urbex-frontend --index-document index.html --error-document index.html

# Configurar política del bucket
aws s3api put-bucket-policy --bucket urbex-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::urbex-frontend/*"
    }
  ]
}'
```

### Paso 2: Configurar CloudFront
```bash
# Crear distribución con error pages
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Paso 3: Deploy
```bash
# Build y deploy
npm run build
aws s3 sync out/ s3://urbex-frontend --delete
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

## 📋 Checklist de Verificación

- [ ] S3 bucket configurado con `index.html` como error document
- [ ] CloudFront configurado con Custom Error Pages (404 → 200 + /index.html)
- [ ] Next.js configurado con `output: 'export'` y `trailingSlash: true`
- [ ] Build genera archivos estáticos correctamente
- [ ] Deploy script actualizado
- [ ] Testing local con servidor estático
- [ ] Testing en S3/CloudFront

## 🚀 Resultado Esperado

Después de implementar esta solución:

✅ `https://urbex.com.co/dashboard` → Funciona  
✅ `https://urbex.com.co/auth/login` → Funciona  
✅ `https://urbex.com.co/properties` → Funciona  
✅ Refresh en cualquier página → Funciona  
✅ Enlaces directos → Funcionan  

## 🔍 Troubleshooting

### Si aún hay 404s:
1. Verificar que CloudFront esté configurado correctamente
2. Invalidar cache de CloudFront
3. Verificar que S3 tenga el error document configurado
4. Revisar logs de CloudFront

### Si hay problemas de cache:
1. Configurar headers de cache apropiados
2. Usar versioning en archivos estáticos
3. Invalidar cache después de cada deploy

---

**Fecha:** 2025-09-30  
**Estado:** ✅ Solución implementada y documentada
