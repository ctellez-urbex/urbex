# Solución: Cognito no funciona en Local con Credenciales de Producción

## 🔍 Problema

Cuando usas credenciales de producción de Cognito en desarrollo local, pueden ocurrir varios problemas:

1. **CORS Errors**: El Client App puede tener restricciones de origen
2. **Redirect URI Mismatch**: El Client no tiene configurado `http://localhost:3000` como callback URL
3. **OAuth Settings**: El Client requiere URLs específicas para sign-in/sign-out

## ✅ Solución Implementada

### Cambios Realizados

1. **Prioridad de Variables de Entorno**:
   - En **desarrollo**: Usa `process.env` (desde `.env.local`) primero
   - En **producción**: Usa `window.ENV` (desde `public/env.js`) primero

2. **Mejor Debugging**:
   - Logs detallados en desarrollo
   - Validación de configuración
   - Información completa del pool de Cognito

### Verificación

1. **Abre la consola del navegador** (F12)
2. **Busca estos logs** al iniciar sesión:
   ```
   🔧 [DEV] Using NEXT_PUBLIC_AWS_USER_POOL_ID from process.env
   🔧 [DEV] Using NEXT_PUBLIC_AWS_POOL_CLIENT_ID from process.env
   🔧 Cognito Configuration: {...}
   🔍 Starting authentication process...
   🔍 Pool configuration: {...}
   ```

3. **Si ves errores**, verifica:
   - Las credenciales en `.env.local`
   - La configuración del Client App en AWS Cognito

## 🔧 Configuración Requerida en AWS Cognito

### Paso 1: Verificar Client App Settings

1. Ve a **AWS Console** → **Cognito** → **User Pools**
2. Selecciona tu User Pool: `us-east-2_Fpda5LMX0`
3. Ve a **App integration** → **App clients**
4. Selecciona tu Client: `5kvmdd29oj2lpnq9b4j60gfe69`

### Paso 2: Configurar Callback URLs

1. En **Hosted UI settings**, agrega:
   - **Allowed callback URLs**:
     ```
     http://localhost:3000/auth/login
     http://localhost:3000/auth/register
     http://localhost:3000/auth/verify-email
     http://localhost:3000/dashboard
     http://localhost:3000/*
     ```

2. **Allowed sign-out URLs**:
   ```
   http://localhost:3000
   http://localhost:3000/auth/login
   ```

### Paso 3: Verificar OAuth Settings

1. En **OAuth 2.0 settings**, verifica:
   - **Allowed OAuth flows**:
     - ✅ Authorization code grant
     - ✅ Implicit grant
   - **Allowed OAuth scopes**:
     - ✅ openid
     - ✅ email
     - ✅ profile

### Paso 4: Verificar Authentication Flow

1. En **App client settings**, verifica:
   - ✅ **ALLOW_USER_PASSWORD_AUTH** está habilitado
   - ✅ **ALLOW_USER_SRP_AUTH** está habilitado

## 🐛 Troubleshooting

### Error: "Invalid redirect URI"

**Causa**: El Client App no tiene configurado `http://localhost:3000` como callback URL.

**Solución**:
1. Agrega las URLs de localhost en AWS Cognito (ver Paso 2 arriba)
2. Espera unos minutos para que los cambios se propaguen

### Error: "CORS policy"

**Causa**: El Client App tiene restricciones de origen.

**Solución**:
1. En **App client settings**, verifica que no haya restricciones de origen
2. O agrega `http://localhost:3000` a las URLs permitidas

### Error: "User pool client does not exist"

**Causa**: El Client ID no existe o está incorrecto.

**Solución**:
1. Verifica el Client ID en `.env.local`
2. Verifica que el Client existe en AWS Cognito
3. Regenera el Client ID si es necesario

### Error: "Network error" o "Connection timeout"

**Causa**: Problemas de red o firewall.

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que no haya firewall bloqueando `cognito-idp.us-east-2.amazonaws.com`
3. Prueba desde otro navegador o en modo incógnito

## 📝 Verificación de Configuración

### Verificar .env.local

```bash
# Debe tener estas variables:
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=5kvmdd29oj2lpnq9b4j60gfe69
```

### Verificar en Consola del Navegador

```javascript
// Ejecuta en la consola del navegador:
console.log('User Pool ID:', window.ENV?.NEXT_PUBLIC_AWS_USER_POOL_ID);
console.log('Client ID:', window.ENV?.NEXT_PUBLIC_AWS_POOL_CLIENT_ID);
console.log('Region:', window.ENV?.NEXT_PUBLIC_AWS_REGION);
```

### Verificar que el Servidor esté Corriendo

```bash
npm run dev
```

Deberías ver:
```
🔧 [DEV] Using NEXT_PUBLIC_AWS_USER_POOL_ID from process.env
🔧 [DEV] Using NEXT_PUBLIC_AWS_POOL_CLIENT_ID from process.env
🔧 Cognito Configuration: {...}
```

## 🚀 Próximos Pasos

1. **Actualiza AWS Cognito** con las URLs de localhost (Paso 2)
2. **Reinicia el servidor** de desarrollo
3. **Prueba el login** y verifica los logs en la consola
4. **Si persiste el problema**, revisa los errores específicos en la consola

## 📚 Referencias

- [AWS Cognito User Pool App Clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)
- [Cognito OAuth 2.0 Settings](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html)

