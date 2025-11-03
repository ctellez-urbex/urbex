# 🗺️ Configuración de Mapbox para el Mapa 3D

## Paso 1: Crear cuenta en Mapbox

1. Ve a: https://account.mapbox.com/auth/signup/
2. Regístrate con tu email
3. Crea una contraseña segura
4. Acepta los términos y condiciones
5. Haz clic en "Get started"

## Paso 2: Verificar tu email

1. Revisa tu bandeja de entrada
2. Busca el email de Mapbox
3. Haz clic en el enlace de verificación
4. Esto te llevará a tu dashboard

## Paso 3: Obtener tu Access Token

1. Una vez en tu dashboard (https://account.mapbox.com/)
2. Verás una sección llamada "Access tokens"
3. Encontrarás tu **Default public token**
4. Se ve algo así: `pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example`
5. Haz clic en el icono de **copiar** 📋

## Paso 4: Configurar en tu proyecto

1. Abre tu archivo `.env.local` (o créalo si no existe)
2. Agrega esta línea:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.tu_token_completo_aqui
```

**Ejemplo completo de `.env.local`:**

```bash
# API Externa
NEXT_PUBLIC_API_BASE_URL=https://api.urbex.com.co
NEXT_PUBLIC_API_KEY=tu_api_key

# AWS Cognito
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=tu_client_id

# Maps APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.tu_mapbox_token_aqui
```

## Paso 5: Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

## Paso 6: Verificar que funciona

1. Abre tu aplicación en el navegador
2. Ve a la página de detail_property
3. Deberías ver el mapa 3D cargando
4. En la consola del navegador verás:
   ```
   ✅ Mapbox 3D initialized successfully
   ```

## 🎉 ¡Listo!

Ahora deberías ver:
- **Street View** (vista de calle)
- **Vista Satelital** (con polígono de la propiedad)
- **Mapa 3D** (edificios extruidos en 3D)

---

## ❓ Solución de Problemas

### No veo el mapa 3D

**Revisa la consola del navegador (F12):**

1. **Si ves**: `⚠️ Mapbox token not configured`
   - Verifica que agregaste el token en `.env.local`
   - Asegúrate de que el token empiece con `pk.`
   - Reinicia el servidor

2. **Si ves**: `❌ Error initializing Mapbox: Invalid token`
   - Tu token es inválido
   - Genera un nuevo token en Mapbox
   - Copia y pega cuidadosamente (sin espacios extras)

3. **Si ves**: `Chart.js not loaded yet`
   - Es normal, se reintenta automáticamente
   - Espera unos segundos

### El token es gratuito?

**SÍ!** Mapbox ofrece:
- ✅ 50,000 cargas de mapa gratis al mes
- ✅ Suficiente para desarrollo y pruebas
- ✅ No necesitas tarjeta de crédito inicialmente

---

## 📚 Recursos Adicionales

- **Dashboard de Mapbox**: https://account.mapbox.com/
- **Documentación**: https://docs.mapbox.com/
- **Ejemplos**: https://docs.mapbox.com/mapbox-gl-js/examples/

---

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver mensajes de error específicos.

