# 🚀 Deployment Scripts Guide

Este documento explica las diferencias entre los scripts de deployment disponibles y cuándo usar cada uno.

## 📋 Scripts Disponibles

### 1. `deploy-s3-only.js` (Node.js)
**Comando:** `npm run deploy:s3-only`

**Descripción:** Deployment simple y directo a S3 sin configuración adicional.

**Características:**
- ✅ Script en Node.js (cross-platform)
- ✅ Solo sube archivos a S3
- ✅ Verifica bucket y configuración
- ✅ Configura cache headers automáticamente
- ❌ NO hace build (requiere `npm run build` primero)
- ❌ NO configura website hosting
- ❌ NO invalida CloudFront
- ❌ NO configura routing

**Uso:**
```bash
# 1. Build primero
npm run build

# 2. Deploy
npm run deploy:s3-only
```

**Variables de Entorno:**
```bash
S3_BUCKET_NAME=tu-bucket
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu-key
AWS_SECRET_ACCESS_KEY=tu-secret
```

**Cuándo usar:**
- Deployment rápido de prueba
- Solo necesitas subir archivos, no configurar nada más
- Ya tienes el bucket configurado como website
- Cross-platform (Windows/Mac/Linux)

---

### 2. `deploy-s3-clean.sh` (Bash)
**Comando:** `npm run deploy:s3-clean`

**Descripción:** Deployment completo con configuración de URLs limpias y website hosting.

**Características:**
- ✅ Script en Bash (Unix/Mac/Linux)
- ✅ Build automático (limpia `out/` y `.next/`)
- ✅ Configura S3 website hosting
- ✅ Configura routing limpio (sin `index.html` en URLs)
- ✅ Sube archivos con cache headers optimizados
- ✅ Invalida CloudFront (opcional, si `CF_DISTRIBUTION_ID` está configurado)
- ✅ Aplica configuración desde `s3-website-config.json`
- ✅ URLs limpias funcionando (ej: `/dashboard` en lugar de `/dashboard/index.html`)

**Uso:**
```bash
# Todo en un comando (build + deploy)
npm run deploy:s3-clean
```

**Variables de Entorno:**
```bash
S3_BUCKET_NAME=urbex-frontend  # Default: urbex-frontend
AWS_REGION=us-east-2          # Default: us-east-2
CF_DISTRIBUTION_ID=xxx         # Opcional
```

**Configuración Adicional:**
- Usa `s3-website-config.json` si existe
- Configura index/error documents automáticamente

**Cuándo usar:**
- Deployment de producción
- Necesitas URLs limpias
- Primera vez configurando el bucket
- Quieres build + deploy en un paso
- Sistema Unix/Mac/Linux

---

## 📊 Comparación Rápida

| Característica | `deploy-s3-only.js` | `deploy-s3-clean.sh` |
|----------------|---------------------|----------------------|
| **Lenguaje** | Node.js | Bash |
| **Platform** | Cross-platform | Unix/Mac/Linux |
| **Build Automático** | ❌ NO | ✅ SÍ |
| **Configura Website** | ❌ NO | ✅ SÍ |
| **URLs Limpias** | ❌ NO | ✅ SÍ |
| **CloudFront Invalidation** | ❌ NO | ⚠️ Opcional |
| **Cache Headers** | ✅ SÍ | ✅ SÍ |
| **Verificación** | ✅ Básica | ✅ Completa |
| **Velocidad** | 🚀 Rápido | 🐢 Más lento (hace build) |

---

## 🎯 Recomendación de Uso

### Para Desarrollo / Testing:
```bash
npm run build
npm run deploy:s3-only
```
**Razón:** Más rápido, ya sabes que el build funciona.

### Para Producción:
```bash
npm run deploy:s3-clean
```
**Razón:** Todo automático, URLs limpias, mejor configuración.

---

## 🔧 Configuración Requerida

### Variables de Entorno (`.env.local`):
```bash
# AWS Configuration
S3_BUCKET_NAME=urbex-frontend
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key

# CloudFront (opcional)
CF_DISTRIBUTION_ID=E1234567890ABC
```

### Configuración del Bucket (Primera Vez):

**Con `deploy-s3-clean.sh`:**
- Se configura automáticamente ✅

**Con `deploy-s3-only.js`:**
- Debes configurar manualmente:
```bash
aws s3 website s3://tu-bucket \
  --index-document index.html \
  --error-document 404.html \
  --region us-east-2
```

---

## 📝 Flujo de Trabajo Recomendado

### Desarrollo Iterativo:
```bash
# 1. Hacer cambios
# ... editar código ...

# 2. Build local para probar
npm run build
npm run serve:static

# 3. Si funciona, deploy rápido
npm run deploy:s3-only

# 4. Probar en producción
# ... visitar URL ...

# 5. Si todo bien, commit
git add .
git commit -m "Feature XYZ deployed"
git push
```

### Deploy de Producción:
```bash
# 1. Asegurarse que todo funciona localmente
npm run build
npm run serve:static

# 2. Deploy completo con configuración
npm run deploy:s3-clean

# 3. Verificar en producción
# ... probar URLs ...

# 4. Commit del deploy
git add .
git commit -m "Production deploy - Feature XYZ"
git push
```

---

## 🚨 Troubleshooting

### Error: "Build directory not found"
**Solución:** Ejecuta `npm run build` primero

### Error: "S3 bucket not accessible"
**Solución:** Verifica tus credenciales AWS y permisos del bucket

### Error: "index.html not found"
**Solución:** El build falló o no se completó. Revisa el output de `npm run build`

### URLs no funcionan (404)
**Con `deploy-s3-only.js`:**
- El bucket no está configurado como website
- Ejecuta: `aws s3 website s3://tu-bucket --index-document index.html`

**Con `deploy-s3-clean.sh`:**
- Revisa que `s3-website-config.json` existe y está bien configurado

### Error: "NoSuchBucket" o "The specified bucket does not exist"
**Causa:** El bucket S3 no existe en AWS.

**Solución:** ✅ **SOLUCIONADO AUTOMÁTICAMENTE**
- Ambos scripts ahora **crean el bucket automáticamente** si no existe
- Solo asegúrate de que:
  1. Las credenciales AWS tienen permisos para crear buckets
  2. El nombre del bucket es **globalmente único** (no puede estar duplicado en toda AWS)
  3. La región especificada es correcta

**Si el bucket no se puede crear automáticamente:**
```bash
# Crear bucket manualmente
aws s3api create-bucket \
  --bucket tu-bucket-name \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2

# O para us-east-1 (no necesita LocationConstraint)
aws s3api create-bucket \
  --bucket tu-bucket-name \
  --region us-east-1
```

**Verificar que el bucket existe:**
```bash
aws s3 ls | grep tu-bucket-name
```

### Problemas en Windows con `deploy-s3-clean.sh`
**Solución:** Usa `deploy-s3-only.js` en Windows o usa WSL/Git Bash

---

## 📚 Archivos Relacionados

- `scripts/deploy-s3-only.js` - Script Node.js simple
- `scripts/deploy-s3-clean.sh` - Script Bash completo
- `scripts/deploy.js` - Script deployment completo con CloudFront
- `s3-website-config.json` - Configuración de routing para S3
- `.env.local` - Variables de entorno (no commiteado)

---

## ✅ Checklist de Deployment

Antes de hacer deploy, verifica:

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Build funciona localmente (`npm run build`)
- [ ] Archivos `out/` generados correctamente
- [ ] `index.html` existe en `out/`
- [ ] Credenciales AWS válidas
- [ ] Permisos de bucket correctos
- [ ] (Opcional) `s3-website-config.json` configurado
- [ ] (Opcional) CloudFront distribution ID si usas CDN

---

**Última actualización:** Octubre 2025

