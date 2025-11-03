# Properties - Detail Integration Guide

## Descripción General

Esta guía documenta la integración entre la página de **Properties** y **Detail Property**, permitiendo que cuando se seleccione una propiedad y se haga clic en "Ver Detalles", se abra una nueva ventana con información detallada de la propiedad.

## Flujo de Integración

```
Properties Page → Seleccionar Propiedad → "Ver Detalles" → Nueva Ventana → Detail Property
```

### 1. **Selección de Propiedad** (`/properties`)
- Usuario realiza búsqueda de propiedades
- Selecciona una propiedad del mapa o lista
- Se muestra información básica en el panel lateral
- Aparece botón **"Ver Detalles"**

### 2. **Generación de Token** (Automático)
- Se crea objeto completo con datos de la propiedad
- Se encripta usando `encryptBarmanpre()`
- Se genera URL con token encriptado
- Se abre nueva ventana con `window.open()`

### 3. **Página de Detalle** (`/detail_property`)
- Recibe token como parámetro de URL
- Desencripta y parsea los datos
- Ejecuta 3 APIs para información adicional
- Muestra interfaz completa con menú responsive

## Implementación Técnica

### Datos Transmitidos

El token contiene un objeto JSON completo con:

```typescript
interface PropertyData {
  id: string;                    // ID único (barmanpre)
  address: string;               // Dirección formateada
  estrato?: number;              // Estrato socioeconómico
  area?: number;                 // Área en m²
  bedrooms?: number;             // Número de alcobas
  bathrooms?: number;            // Número de baños
  floors?: number;               // Número de pisos
  yearBuilt?: {                  // Rango de año de construcción
    min: number;
    max: number;
  };
  coordinates?: {                // Coordenadas geográficas
    lat: number;
    lng: number;
  };
  barmanpre?: string;           // Matrícula inmobiliaria
}
```

### Código del Botón "Ver Detalles"

```typescript
<button
  onClick={() => {
    // Crear objeto completo con información de la propiedad
    const propertyData = {
      id: selectedProperty.barmanpre,
      address: selectedProperty.formato_direccion,
      estrato: selectedProperty.estrato,
      area: selectedProperty.conarea,
      bedrooms: selectedProperty.connalcobas,
      bathrooms: selectedProperty.connbanos,
      floors: selectedProperty.connpisos,
      yearBuilt: {
        min: selectedProperty.prevetustzmin,
        max: selectedProperty.prevetustzmax
      },
      coordinates: selectedProperty.coordinates || null,
      barmanpre: selectedProperty.barmanpre
    };
    
    // Encriptar el objeto completo
    const encryptedToken = encryptBarmanpre(JSON.stringify(propertyData));
    const detailUrl = `/detail_property?token=${encodeURIComponent(encryptedToken)}`;
    
    console.log('🚀 Abriendo detalle de propiedad:', propertyData);
    window.open(detailUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  }}
  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
>
  Ver Detalles
</button>
```

## Características de la Nueva Ventana

### Configuración de `window.open()`
```javascript
window.open(detailUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
```

- **Target**: `_blank` - Nueva ventana/pestaña
- **Dimensiones**: 1200x800 píxeles
- **Scrollbars**: Habilitadas para contenido largo
- **Resizable**: Usuario puede redimensionar

### Funcionalidades en Detail Property

1. **Desencriptación Automática**
   - Token se desencripta al cargar la página
   - Validación y manejo de errores
   - Parsing de JSON con fallback a ID simple

2. **Visualización de Datos**
   - Información básica de la propiedad
   - Layout responsive con grid
   - Campos opcionales manejados correctamente

3. **Ejecución de APIs**
   - Property Details API
   - Property Analysis API  
   - Market Study API
   - Estados de carga en tiempo real

4. **Menú Responsive**
   - Navegación entre secciones
   - Soporte para móvil y desktop
   - Temas claro/oscuro

## Testing y Verificación

### 1. Prueba Manual Completa

```bash
# 1. Iniciar servidor
npm run build
npm run serve:clean

# 2. Abrir properties
http://localhost:3001/properties

# 3. Realizar búsqueda
# 4. Seleccionar propiedad
# 5. Clic en "Ver Detalles"
# 6. Verificar nueva ventana
```

### 2. Verificación de Token

```javascript
// En consola del navegador (Properties page)
const testData = {
  id: 'test_123',
  address: 'Test Address',
  estrato: 4
};
const token = encryptBarmanpre(JSON.stringify(testData));
console.log('Token:', token);

// URL de prueba
const url = `/detail_property?token=${encodeURIComponent(token)}`;
window.open(url, '_blank');
```

### 3. Logs de Debugging

**Properties Page:**
```
🚀 Abriendo detalle de propiedad: {id: "...", address: "..."}
```

**Detail Property Page:**
```
🔓 Desencriptando token...
✅ Token desencriptado: {id: "...", address: "..."}
📡 Ejecutando: Property Details
📡 Ejecutando: Property Analysis  
📡 Ejecutando: Market Study
🎉 Todas las llamadas a APIs completadas
```

## Manejo de Errores

### Errores Posibles y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| Token vacío | URL sin parámetro token | Verificar que se pase el token |
| Error de desencriptación | Token corrupto/inválido | Regenerar token desde properties |
| Datos incompletos | Propiedad sin algunos campos | Campos opcionales manejados |
| APIs fallan | Problemas de conectividad | Datos mock como fallback |
| Nueva ventana bloqueada | Bloqueador de pop-ups | Permitir pop-ups para el sitio |

### Validaciones Implementadas

1. **Token presente** en URL
2. **Token no vacío** después de desencriptar
3. **JSON válido** o fallback a ID simple
4. **Campos requeridos** (id, address) presentes
5. **APIs con timeout** y manejo de errores

## Configuración de Desarrollo

### Variables de Entorno
```bash
# APIs de propiedades
NEXT_PUBLIC_PROPERTIES_API_BASE_URL=https://api.urbex.com/v1
NEXT_PUBLIC_PROPERTIES_API_KEY=your_api_key

# Configuración local
NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL=http://127.0.0.1:8000
```

### Scripts Útiles
```bash
# Build y servidor
npm run build && npm run serve:clean

# Solo servidor (requiere build previo)
npm run serve:clean

# Limpiar y rebuild
npm run clean && npm run build
```

## Mejores Prácticas

### 1. Seguridad
- ✅ Tokens encriptados para datos sensibles
- ✅ Validación de entrada en detail_property
- ✅ No exposición de datos en logs de producción
- ✅ URLs con encoding apropiado

### 2. UX/UI
- ✅ Nueva ventana con dimensiones apropiadas
- ✅ Estados de carga visibles
- ✅ Manejo de errores con mensajes claros
- ✅ Responsive design en ambas páginas

### 3. Performance
- ✅ APIs ejecutadas secuencialmente para evitar sobrecarga
- ✅ Datos mock como fallback rápido
- ✅ Lazy loading con Suspense
- ✅ Optimización de bundle size

### 4. Mantenibilidad
- ✅ Código modular y reutilizable
- ✅ Tipos TypeScript completos
- ✅ Documentación exhaustiva
- ✅ Logs de debugging apropiados

## Próximas Mejoras

### 1. Funcionalidades
- [ ] Cache de datos de propiedades
- [ ] Historial de propiedades vistas
- [ ] Compartir enlaces de propiedades
- [ ] Exportar información a PDF

### 2. Optimizaciones
- [ ] APIs en paralelo cuando sea posible
- [ ] Preload de datos críticos
- [ ] Service Worker para offline
- [ ] Compresión de tokens

### 3. Analytics
- [ ] Tracking de propiedades más vistas
- [ ] Métricas de tiempo en detail_property
- [ ] Análisis de flujo de usuarios
- [ ] A/B testing de layouts

## Troubleshooting

### Problema: Nueva ventana no abre
**Causa**: Bloqueador de pop-ups  
**Solución**: Permitir pop-ups para localhost:3001

### Problema: Token no se desencripta
**Causa**: Función de encriptación no disponible  
**Solución**: Verificar import de `encryptBarmanpre`

### Problema: APIs no responden
**Causa**: Endpoints no configurados  
**Solución**: Verificar configuración en `api-detail-property.ts`

### Problema: Datos no se muestran
**Causa**: Campos opcionales undefined  
**Solución**: Usar conditional rendering (`&&`)

## Recursos Adicionales

- [Clean Routing Guide](./clean-routing-guide.md)
- [Detail Property Guide](./detail-property-guide.md)
- [API Configuration](../src/config/api-detail-property.ts)
- [Encryption Utils](../src/lib/encryption.ts)
