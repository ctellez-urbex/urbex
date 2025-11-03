# Detail Property - API Integration Documentation

## Overview

The Detail Property page now integrates two separate API endpoints to display comprehensive property information. Each component receives specific data types from the appropriate API response.

## API Endpoints

### 1. getDetailBuilding
**Endpoint:** `/getDetalleBuilding`  
**Method:** POST  
**Purpose:** Get building-level property information

#### Request
```typescript
{
  barmanpre: string,        // Property ID
  get_table: true,
  get_tabla_last_year: true
}
```

#### Response: DetailBuildingResponse
```typescript
interface DetailBuildingResponse {
  data_caracteristicas: any;       // Property characteristics
  data_lote_polygon: any;          // Lot geometry
  data_prediales_actuales?: any;   // Tax information
  data_transacciones?: any;        // Transaction history
  data_propietarios?: any;         // Owners information
  data_pot?: any;                  // POT regulations
  data_dane?: any;                 // DANE demographics
  data_ctl?: any;                  // CTL data
  data_licencias?: any;            // Construction licenses
  data_market?: any;               // Market analysis
  data_market_barrio?: any;        // Neighborhood market stats
  data_reporting_barrio?: any;     // Area reports
}
```

### 2. getDetailUnit
**Endpoint:** `/getDetalleUnidad`  
**Method:** POST  
**Purpose:** Get unit-level property information

#### Request
```typescript
{
  barmanpre: string,        // Property ID
  get_table: true,
  get_tabla_last_year: false
}
```

#### Response: DetailUnitResponse
```typescript
interface DetailUnitResponse {
  data_prediales_actuales: any;   // Unit tax information
  data_transacciones: any;        // Unit transactions
  data_propietarios: any;         // Unit owners
  data_ctl: any;                  // CTL unit data
}
```

## Component Data Mapping

| Component | Receives | Data Source |
|-----------|----------|-------------|
| Overview (Descripción General) | `DetailBuildingResponse` | `buildingDetails` |
| UnitAnalysis (Análisis de Unidad) | `DetailUnitResponse` | `unitDetails` |
| MarketStudy (Estudio de Mercado) | `DetailBuildingResponse` | `buildingDetails` |
| LotSimulation (Simulación de Desarrollo) | `DetailBuildingResponse` | `buildingDetails` |
| Owners (Propietarios) | Both responses | `buildingDetails` + `unitDetails` |

## Page Implementation

### State Management

```typescript
// Separate states for each API response
const [buildingDetails, setBuildingDetails] = useState<DetailBuildingResponse | null>(null);
const [unitDetails, setUnitDetails] = useState<DetailUnitResponse | null>(null);

// API call tracking
const [apiCalls, setApiCalls] = useState<ApiCallStatus[]>([
  { name: 'Building Details', status: 'pending' },
  { name: 'Unit Details', status: 'pending' },
]);
```

### API Execution Flow

```typescript
const executeApiCalls = async (propertyData: PropertyData) => {
  const apiCallsToExecute = [
    {
      name: 'Building Details',
      apiCall: () => getDetailBuilding(propertyData.id),
      setState: setBuildingDetails
    },
    {
      name: 'Unit Details',
      apiCall: () => getDetailUnit(propertyData.id),
      setState: setUnitDetails
    },
  ];

  // Execute APIs sequentially with 500ms delay between calls
  for (let i = 0; i < apiCallsToExecute.length; i++) {
    // Update status to loading
    // Call API
    // Store result in corresponding state
    // Update status to success/error
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
```

### Component Rendering

```typescript
switch (activeContent) {
  case 'overview':
    // Descripción General receives DetailBuildingResponse
    return (
      <Overview 
        data={buildingDetails || {}} 
        propertyData={decryptedData || undefined} 
      />
    );
  
  case 'unit-analysis':
    // Análisis de Unidad receives DetailUnitResponse
    return (
      <UnitAnalysis 
        data={unitDetails || {}} 
      />
    );
  
  case 'market-study':
    // Estudio de Mercado receives DetailBuildingResponse
    return (
      <MarketStudy 
        data={buildingDetails || {}} 
      />
    );
  
  case 'lot-simulation':
    // Simulación de Desarrollo receives DetailBuildingResponse
    return (
      <LotSimulation 
        data={buildingDetails || {}} 
      />
    );
  
  case 'owners':
    // Propietarios receives both responses
    return (
      <Owners 
        buildingData={buildingDetails || {}}
        unitData={unitDetails || {}}
      />
    );
}
```

## Component Details

### 1. Overview (Descripción General)

**Data Source:** `DetailBuildingResponse`

**Displays:**
- Property identification (barmanpre, address)
- Physical characteristics (areas, stratum, age)
- Cadastral information (appraisal values)
- Location details (neighborhood, locality)

**Key Fields Used:**
- `data_caracteristicas` - Property characteristics
- `data_prediales_actuales` - Tax data
- `propertyData` - Decrypted token data

### 2. UnitAnalysis (Análisis de Unidad)

**Data Source:** `DetailUnitResponse`

**Displays:**
- Tax information (avalúo, valor m²)
- Unit transactions history
- Unit owners list
- CTL unit data

**Key Fields Used:**
- `data_prediales_actuales` - Unit tax information
- `data_transacciones` - Unit transactions
- `data_propietarios` - Unit owners
- `data_ctl` - CTL data

### 3. MarketStudy (Estudio de Mercado)

**Data Source:** `DetailBuildingResponse`

**Displays:**
- Market value analysis
- Neighborhood statistics
- Transaction history (building level)
- Market reporting

**Key Fields Used:**
- `data_market` - Market analysis
- `data_market_barrio` - Neighborhood stats
- `data_transacciones` - Building transactions
- `data_reporting_barrio` - Area reports

### 4. LotSimulation (Simulación de Desarrollo)

**Data Source:** `DetailBuildingResponse`

**Displays:**
- Development potential calculation
- POT regulations
- Construction capacity
- CTL information (building level)

**Key Fields Used:**
- `data_pot` - POT regulations
- `data_caracteristicas` - For calculations
- `data_ctl` - CTL building data

### 5. Owners (Propietarios)

**Data Sources:** Both `DetailBuildingResponse` and `DetailUnitResponse`

**Displays:**
- Detailed owners list (from unit data)
- DANE demographic data (from building data)
- Population statistics
- Ownership details

**Key Fields Used:**
- `unitData.data_propietarios` - Detailed owner info
- `buildingData.data_dane` - Demographics

## Loading States

The page handles three main states:

### 1. Decrypting State
```typescript
if (isDecrypting) {
  return <DecryptingSpinner />;
}
```

### 2. API Loading State
```typescript
if (isLoading) {
  return (
    <LoadingIndicator>
      {apiCalls.map(call => (
        <StatusIcon status={call.status} />
      ))}
    </LoadingIndicator>
  );
}
```

### 3. Error State
```typescript
if (decryptError) {
  return <ErrorMessage message={decryptError} />;
}
```

## Error Handling

Each API call includes error handling:

```typescript
try {
  const result = await apiCall.apiCall();
  apiCall.setState(result);
  setApiCalls(prev => prev.map((call, index) => 
    index === i ? { ...call, status: 'success', data: result } : call
  ));
} catch (error) {
  setApiCalls(prev => prev.map((call, index) => 
    index === i ? { 
      ...call, 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Error desconocido'
    } : call
  ));
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each API provides specific data
2. **Type Safety**: TypeScript interfaces for all responses
3. **Independent Loading**: Each API can be tracked separately
4. **Flexibility**: Easy to add more API calls
5. **Maintainability**: Clear data flow from API to component
6. **Performance**: Only necessary data is loaded
7. **Error Resilience**: Individual API failures don't break entire page

## Testing

### Unit Tests
```typescript
describe('Detail Property Page', () => {
  it('should call both APIs on load', async () => {
    // Test implementation
  });
  
  it('should handle API errors gracefully', async () => {
    // Test implementation
  });
  
  it('should pass correct data to each component', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Component Data Integration', () => {
  it('Overview should receive building data', () => {
    // Test implementation
  });
  
  it('UnitAnalysis should receive unit data', () => {
    // Test implementation
  });
  
  it('Owners should receive both data sources', () => {
    // Test implementation
  });
});
```

## Future Enhancements

1. **Parallel API Calls**: Execute both APIs simultaneously
2. **Caching**: Cache API responses for faster navigation
3. **Retry Logic**: Automatic retry on API failures
4. **Optimistic Updates**: Show cached data while loading
5. **Progressive Loading**: Show available data while other APIs load

## Related Documentation

- [Detail Property Architecture](./detail-property-architecture.md)
- [API Configuration](../src/config/api-detail-property.ts)
- [Component Specifications](./detail-property-components.md)

---

**Last Updated**: October 1, 2025  
**Version**: 2.0  
**Maintained By**: Urbex Development Team

