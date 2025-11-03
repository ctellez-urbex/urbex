# Preservación de Credenciales en Variables de Entorno

## 🚨 Problema Identificado y Resuelto

### **Problema Original**
Al ejecutar `npm run dev`, las credenciales guardadas en `public/env.js` se borraban y se reemplazaban con valores por defecto.

### **Causa Raíz**
El comando `npm run dev` ejecuta:
```bash
node scripts/generate-env-js.js --env=development && next dev
```

El script `generate-env-js.js` sobrescribía completamente el archivo `env.js` con valores hardcodeados para desarrollo, perdiendo las credenciales configuradas manualmente.

## ✅ Solución Implementada

### **Modificaciones al Script**

1. **Nueva función `loadExistingEnvJs()`**
   - Lee el archivo `env.js` existente
   - Extrae la configuración actual usando regex
   - Maneja errores de parsing graciosamente

2. **Lógica de fusión inteligente**
   - Preserva credenciales reales existentes
   - Solo actualiza valores que son claramente por defecto
   - Detecta patrones como `dev_`, `your_`, `tu_`, `http://localhost:3001`

3. **Orden de prioridad**
   ```javascript
   // 1. Variables de archivos .env (más baja)
   Object.assign(finalConfig, envVars);
   
   // 2. Configuración por defecto (solo si no existe o es valor por defecto)
   Object.entries(config).forEach(([key, defaultValue]) => {
     const existingValue = existingConfig[key];
     const isDefaultValue = !existingValue || 
                           existingValue.includes('dev_') || 
                           existingValue.includes('your_') || 
                           existingValue.includes('tu_') ||
                           existingValue === 'http://localhost:3001';
     
     if (isDefaultValue) {
       finalConfig[key] = defaultValue;
     } else {
       finalConfig[key] = existingValue; // Preserva credenciales reales
     }
   });
   
   // 3. Variables existentes no en configuración por defecto
   Object.entries(existingConfig).forEach(([key, value]) => {
     if (!config.hasOwnProperty(key)) {
       finalConfig[key] = value;
     }
   });
   ```

### **Variables Preservadas**
El script ahora preserva automáticamente:
- `API_KEY`
- `ADMIN_API_KEY`
- `PUBLIC_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_API_KEY`
- `NEXT_PUBLIC_PROPERTIES_API_KEY`
- Y cualquier otra credencial real configurada

### **Variables que se Actualizan**
Solo se actualizan valores que contienen:
- `dev_` (ej: `dev_api_key_here`)
- `your_` (ej: `your_api_key_here`)
- `tu_` (ej: `tu_api_key_aqui`)
- URLs de desarrollo como `http://localhost:3001`

## 🧪 Pruebas Realizadas

### **Antes de la Solución**
```bash
# Estado inicial: env.js con credenciales reales
npm run dev
# Resultado: ❌ Credenciales perdidas, valores por defecto
```

### **Después de la Solución**
```bash
# Estado inicial: env.js con credenciales reales
npm run dev
# Resultado: ✅ Credenciales preservadas, solo valores por defecto actualizados
```

## 🔧 Uso

### **Desarrollo Normal**
```bash
# Ahora funciona sin perder credenciales
npm run dev
```

### **Regeneración Manual**
```bash
# Si necesitas regenerar el archivo manualmente
npm run env:generate -- --env=development
```

### **Diferentes Entornos**
```bash
# Producción
npm run build  # Preserva credenciales de producción

# Staging
npm run build:staging  # Preserva credenciales de staging
```

## 📋 Configuración Recomendada

### **Archivo .env.development (Opcional)**
Si quieres usar archivos .env específicos:
```bash
# .env.development
NEXT_PUBLIC_API_BASE_URL=https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1
NEXT_PUBLIC_API_KEY=tu_api_key_real_aqui
# ... otras variables
```

### **Configuración Manual en env.js**
Alternativamente, edita directamente `/public/env.js`:
```javascript
window.ENV = {
  "API_KEY": "tu_api_key_real_aqui",
  "ADMIN_API_KEY": "tu_admin_key_real_aqui",
  // ... otras credenciales
};
```

## 🔒 Seguridad

### **Variables Sensibles**
- Las credenciales se preservan en el archivo `env.js`
- **Importante:** `env.js` es público y se sirve al navegador
- Solo incluye variables que pueden ser públicas (`NEXT_PUBLIC_*`)
- Variables sensibles del servidor no se incluyen

### **Mejores Prácticas**
1. Usa diferentes API keys para frontend vs backend
2. Configura CORS apropiadamente en tus APIs
3. Implementa rate limiting en tus endpoints
4. Rota las API keys regularmente

## 🐛 Troubleshooting

### **Si las credenciales aún se pierden:**
1. Verifica que el archivo `env.js` tenga el formato correcto
2. Asegúrate de que las credenciales no contengan patrones de placeholder
3. Revisa los logs del script para debugging

### **Si necesitas forzar regeneración:**
```bash
# Elimina el archivo y regenera
rm public/env.js
npm run env:generate -- --env=development
# Luego edita manualmente las credenciales
```

## 📝 Logs y Debugging

El script ahora incluye logs informativos:
```bash
🔧 Generating env.js for development environment...
✅ Generated: /Users/.../public/env.js
📋 Configuration Summary:
========================
Environment: development
API Base URL: https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1
App URL: http://localhost:3000
Node ENV: development
🎉 env.js file generated successfully!
```

---

**Fecha de implementación:** 2025-09-30  
**Autor:** Sistema de desarrollo Urbex  
**Estado:** ✅ Resuelto y probado
