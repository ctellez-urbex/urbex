# 🔒 SECURITY FIX: Removing Exposed AWS Secrets

## 🚨 PROBLEMA CRÍTICO DETECTADO

GitHub bloqueó tu push porque detectó **secretos de AWS expuestos** en:
- `public/env.js` (líneas 10, 13, 14, 29)
- `scripts/generate-env-js.js` (líneas 26, 29, 36, 38, 61, 63)

**Estos secretos están EXPUESTOS públicamente en el repositorio.**

## ✅ CAMBIOS APLICADOS

1. ✅ **Removidos secretos hardcodeados** de `scripts/generate-env-js.js`
2. ✅ **Agregado `public/env.js` a `.gitignore`** (archivo generado no debe estar en git)
3. ✅ **Removido `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`** del output del frontend
4. ✅ **Actualizado `env.example`** con documentación de seguridad

## 🔧 PASOS PARA RESOLVER

### PASO 1: ⚠️ ROTAR CREDENCIALES EXPUESTAS (URGENTE)

**Las credenciales expuestas deben ser ROTADAS INMEDIATAMENTE:**

1. Ve a AWS Console → IAM → Users → Security credentials
2. Encuentra la Access Key: `AKIAXYKJQUU3HW7AB54M`
3. **DESACTÍVALA O ELIMÍNALA inmediatamente**
4. Crea una nueva Access Key
5. Actualiza tu `.env.local` con las nuevas credenciales

**⚠️ CRÍTICO:** Revisa AWS CloudTrail para verificar si alguien usó estas credenciales.

### PASO 2: Remover archivo del tracking de Git

```bash
# Remover public/env.js del tracking (ya está en .gitignore)
git rm --cached public/env.js

# Verificar que está removido
git status
```

### PASO 3: Agregar cambios de seguridad

```bash
# Agregar los archivos corregidos
git add .gitignore
git add scripts/generate-env-js.js
git add env.example
git add scripts/remove-secrets-from-git.sh

# Verificar cambios
git status
```

### PASO 4: Crear commit de seguridad

```bash
git commit -m "🔒 SECURITY: Remove hardcoded AWS secrets and add env.js to gitignore

- Removed AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from generate-env-js.js
- Added public/env.js to .gitignore (generated file should not be in repo)
- Secrets should only come from .env.local files (never committed)
- Server-side secrets should never be in frontend code
- Updated env.example with security documentation"
```

### PASO 5: Regenerar env.js con valores seguros

```bash
# Asegúrate de tener .env.local con las nuevas credenciales
# Luego regenera env.js
npm run env:generate --env=production
```

### PASO 6: Hacer push

```bash
# Ahora deberías poder hacer push sin problemas
git push origin feature/urbex-002
```

---

## 📋 VERIFICACIÓN POST-FIX

### ✅ Checklist de Seguridad

- [ ] Credenciales AWS rotadas en AWS Console
- [ ] Nueva Access Key creada y guardada en `.env.local`
- [ ] `public/env.js` removido del tracking de Git
- [ ] `.gitignore` actualizado (debe incluir `public/env.js`)
- [ ] `scripts/generate-env-js.js` sin secretos hardcodeados
- [ ] Commit de seguridad creado
- [ ] `env.js` regenerado con valores correctos
- [ ] Push exitoso a GitHub

---

## 🔐 CONFIGURACIÓN CORRECTA

### Archivo `.env.local` (NO COMMITEAR)

```bash
# AWS Credentials (solo para scripts de deployment)
AWS_ACCESS_KEY_ID=tu_nueva_access_key
AWS_SECRET_ACCESS_KEY=tu_nueva_secret_key
AWS_REGION=us-east-2
S3_BUCKET_NAME=urbex-frontend
CF_DISTRIBUTION_ID=tu-distribution-id

# API Keys (si se necesitan para build)
API_KEY=tu_api_key
ADMIN_API_KEY=tu_admin_key
PUBLIC_API_KEY=tu_public_key

# Frontend Public Variables
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co
NEXT_PUBLIC_API_KEY=tu_public_api_key
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=tu_client_id
```

### Verificar que `.env.local` está en `.gitignore`

```bash
cat .gitignore | grep "\.env"
```

Debe mostrar:
```
.env*.local
.env
```

---

## 📚 LECCIONES APRENDIDAS

### ❌ NUNCA HACER:

1. ❌ Hardcodear secretos en código fuente
2. ❌ Commitear archivos generados con secretos (`public/env.js`)
3. ❌ Incluir `AWS_ACCESS_KEY_ID` o `AWS_SECRET_ACCESS_KEY` en frontend
4. ❌ Usar valores reales en archivos de ejemplo

### ✅ SIEMPRE HACER:

1. ✅ Usar `.env.local` para secretos (en `.gitignore`)
2. ✅ Usar `env.example` para documentación (sin valores reales)
3. ✅ Generar `env.js` en build time desde variables de entorno
4. ✅ Rotar credenciales inmediatamente si se exponen
5. ✅ Revisar CloudTrail después de exposición

---

## 🆘 SI EL PUSH SIGUE FALLANDO

Si después de estos cambios GitHub sigue bloqueando:

1. **Opción 1: Remover del historial (solo feature branches)**
   ```bash
   # ⚠️ Solo hacer esto en feature branches, NUNCA en main
   git rebase -i HEAD~3  # O el número de commits que necesites
   # Editar el commit que tiene los secretos
   # Guardar y continuar
   git push origin feature/urbex-002 --force
   ```

2. **Opción 2: Crear nuevo branch desde main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/urbex-002-clean
   # Aplicar tus cambios sin los secretos
   git push origin feature/urbex-002-clean
   ```

3. **Opción 3: Usar URL de GitHub para permitir temporalmente**
   - GitHub te dio URLs para "allow the secret" temporalmente
   - **NO recomendado** - solo para emergencias mientras rotas credenciales

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que todas las credenciales estén rotadas
2. Asegúrate de que `.env.local` existe y tiene valores correctos
3. Revisa que `public/env.js` no esté en Git tracking

---

**Fecha de creación:** $(date)
**Última actualización:** $(date)

