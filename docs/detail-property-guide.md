# Detail Property Guide

## Descripción General

La página `detail_property` es una funcionalidad avanzada que permite mostrar información detallada de propiedades mediante tokens encriptados. Integra el menú responsive y ejecuta múltiples llamadas a APIs para obtener datos completos de la propiedad.

## Características Principales

✅ **Token Encriptado**: Recibe y desencripta tokens seguros con información de propiedades  
✅ **Menú Responsive**: Integra el componente `ResponsiveMenu` para navegación  
✅ **APIs Múltiples**: Ejecuta llamadas paralelas a diferentes endpoints  
✅ **Estado en Tiempo Real**: Muestra el progreso de las llamadas a APIs  
✅ **Datos Mock**: Incluye datos de fallback para desarrollo  
✅ **Manejo de Errores**: Gestión robusta de errores de desencriptación y APIs  

## Arquitectura

### 1. Componentes Principales

```
detail_property/
├── page.tsx                    # Página principal con Suspense
├── DetailPropertyContent       # Componente de contenido principal
└── api-detail-property.ts      # Configuración de APIs
```

### 2. Flujo de Datos

```
Token Encriptado → Desencriptación → Parseo → APIs → Visualización
```

### 3. APIs Integradas

| API | Endpoint | Descripción |
|-----|----------|-------------|
| Property Details | `/properties/details/{id}` | Información básica de la propiedad |
| Property Analysis | `/properties/analysis/{id}` | Análisis de valoración y condición |
| Market Study | `/properties/market-study/{id}` | Estudio de mercado y comparables |

## Uso de la Página

### 1. Acceso con Token

```
/detail_property?token={encrypted_token}
```

**Ejemplo:**
```
http://localhost:3001/detail_property?token=NXcyKIFsF0dHYjY9Pj4zFHt0f258hB5c...
```

### 2. Estructura del Token

El token puede contener:

**Formato JSON:**
```json
{
  "id": "property_123",
  "address": "Calle 123 #45-67, Bogotá",
  "coordinates": {
    "lat": 4.6097,
    "lng": -74.0817
  }
}
```

**Formato Simple:**
```
property_123
```

### 3. Estados de la Página

| Estado | Descripción | UI |
|--------|-------------|-----|
| Loading | Desencriptando token | Spinner + mensaje |
| Error | Error en desencriptación | Ícono de error + mensaje |
| Success | Token procesado | Datos + estado de APIs |

## Configuración de APIs

### 1. Archivo de Configuración

**Ubicación:** `src/config/api-detail-property.ts`

### 2. Funciones Principales

```typescript
// Obtener detalles básicos
getPropertyDetails(propertyId: string): Promise<PropertyDetailsResponse>

// Obtener análisis de valoración
getPropertyAnalysis(propertyId: string): Promise<PropertyAnalysisResponse>

// Obtener estudio de mercado
getMarketStudy(propertyId: string, coordinates?: Coordinates): Promise<MarketStudyResponse>

// Obtener todos los datos en paralelo
getAllPropertyData(propertyId: string, coordinates?: Coordinates): Promise<AllData>
```

### 3. Tipos de Respuesta

```typescript
interface PropertyDetailsResponse {
  id: string;
  address: string;
  area?: number;
  price?: number;
  coordinates?: { lat: number; lng: number };
  // ... más campos
}

interface PropertyAnalysisResponse {
  propertyId: string;
  analysis: {
    marketValue?: number;
    appreciation?: { yearly: number; fiveYear: number };
    condition?: 'excellent' | 'good' | 'fair' | 'poor';
    score?: number;
  };
  recommendations?: string[];
  // ... más campos
}

interface MarketStudyResponse {
  propertyId: string;
  marketData: {
    averagePrice?: number;
    comparableProperties?: Array<ComparableProperty>;
    marketTrends?: MarketTrend;
  };
  neighborhood?: NeighborhoodInfo;
  // ... más campos
}
```

## Generación de Tokens

### 1. Crear Token de Prueba

```javascript
const { encryptBarmanpre } = require('./src/lib/encryption.ts');

// Datos de la propiedad
const propertyData = {
  id: 'property_123',
  address: 'Calle 123 #45-67, Bogotá',
  coordinates: { lat: 4.6097, lng: -74.0817 }
};

// Encriptar
const token = encryptBarmanpre(JSON.stringify(propertyData));
console.log('Token:', token);

// URL completa
const url = `http://localhost:3001/detail_property?token=${encodeURIComponent(token)}`;
```

### 2. Script de Generación

```bash
# Generar token de prueba
node -e "
const { encryptBarmanpre } = require('./src/lib/encryption.ts');
const data = { id: 'test_123', address: 'Test Address' };
console.log('Token:', encryptBarmanpre(JSON.stringify(data)));
"
```

## Integración con Menú

### 1. Menú Responsive

La página integra el componente `ResponsiveMenu` que incluye:

- **Mobile**: Menú hamburguesa colapsible
- **Desktop**: Menú lateral extendido
- **Temas**: Soporte para modo claro/oscuro
- **Navegación**: Contenido dinámico basado en selección

### 2. Secciones del Menú

| Sección | ID | Contenido |
|---------|-----|-----------|
| Descripción General | `overview` | Información básica y token |
| Análisis de Unidad | `unit-analysis` | Datos del análisis de propiedad |
| Estudio de Mercado | `market-study` | Información de mercado |
| Otros | `*` | Contenido genérico |

## Manejo de Errores

### 1. Errores de Token

```typescript
// Token no encontrado
"No se encontró token en la URL"

// Token vacío después de desencriptar
"Token desencriptado está vacío"

// Error de desencriptación
"Error al desencriptar el token. Verifique que sea válido."
```

### 2. Errores de API

```typescript
// Error HTTP
"HTTP 404: Not Found"

// Error de red
"Network Error"

// Timeout
"Request Timeout"
```

### 3. Datos de Fallback

En caso de error en las APIs, se retornan datos mock para desarrollo:

```typescript
// Ejemplo de datos mock
{
  id: propertyId,
  address: 'Dirección de ejemplo',
  price: 250000000,
  analysis: { score: 8.5 },
  marketData: { averagePrice: 245000000 }
}
```

## Testing

### 1. Testing Local

```bash
# Build y servidor
npm run build
npm run serve:clean

# Probar página básica
curl http://localhost:3001/detail_property

# Probar con token
curl "http://localhost:3001/detail_property?token=YOUR_TOKEN"
```

### 2. URLs de Prueba

```bash
# Token simple
http://localhost:3001/detail_property?token=dGVzdF9wcm9wZXJ0eV8xMjM=

# Token complejo (generado dinámicamente)
http://localhost:3001/detail_property?token=NXcyKIFsF0dHYjY9Pj4z...
```

### 3. Casos de Prueba

| Caso | Token | Resultado Esperado |
|------|-------|-------------------|
| Sin token | - | Error: "No se encontró token" |
| Token inválido | `invalid` | Error de desencriptación |
| Token simple | `dGVzdA==` | ID simple parseado |
| Token JSON | `{...}` encriptado | Objeto completo parseado |

## Navegación

### 1. Enlaces en Header

La página está accesible desde el header principal:

```typescript
const authNavLinks = [
  // ... otros enlaces
  { 
    href: "/detail_property?token=dGVzdF9wcm9wZXJ0eV8xMjM=", 
    label: "Detalle Propiedad" 
  },
];
```

### 2. Routing Limpio

Compatible con el sistema de routing limpio:

```bash
# URL limpia
/detail_property?token=...

# Archivo físico
/detail_property/index.html
```

## Desarrollo

### 1. Estructura de Archivos

```
src/
├── app/detail_property/
│   └── page.tsx                    # Página principal
├── config/
│   └── api-detail-property.ts      # APIs
├── components/ui/
│   └── responsive-menu.tsx         # Menú integrado
└── lib/
    └── encryption.ts               # Funciones de encriptación
```

### 2. Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build y test
npm run build
npm run serve:clean

# Generar token
node -e "console.log(require('./src/lib/encryption.ts').encryptBarmanpre('test'))"
```

### 3. Debugging

```typescript
// Logs automáticos en consola
console.log('🔓 Desencriptando token...');
console.log('✅ Token desencriptado:', data);
console.log('📡 Ejecutando: Property Details');
console.log('🎉 Todas las llamadas completadas');
```

## Mejores Prácticas

### 1. Seguridad

- ✅ Validar tokens antes de usar
- ✅ Manejar errores de desencriptación
- ✅ No exponer datos sensibles en logs
- ✅ Usar HTTPS en producción

### 2. Performance

- ✅ Llamadas a APIs en paralelo cuando sea posible
- ✅ Datos de fallback para desarrollo
- ✅ Loading states para UX
- ✅ Suspense boundaries para SSR

### 3. UX

- ✅ Estados de carga visibles
- ✅ Mensajes de error claros
- ✅ Navegación intuitiva
- ✅ Responsive design

## Troubleshooting

### Problema: Token no se desencripta
**Solución**: Verificar que el token esté correctamente codificado en URL

### Problema: APIs no responden
**Solución**: Verificar configuración de endpoints y API keys

### Problema: Página no carga
**Solución**: Verificar que el build incluya la nueva página

### Problema: Menú no funciona
**Solución**: Verificar exportación de `MenuItem` interface

## Próximos Pasos

1. **Integración Real**: Conectar con APIs reales de producción
2. **Cache**: Implementar cache para datos de propiedades
3. **Offline**: Soporte para modo offline
4. **Analytics**: Tracking de uso de la página
5. **Tests**: Implementar tests unitarios y de integración
