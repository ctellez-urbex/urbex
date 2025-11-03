# Detail Property Page - Architecture Documentation

## Overview

The Detail Property page is a comprehensive, modular component system that displays detailed information about real estate properties. It follows Clean Architecture principles, SOLID design patterns, and component-based design for maximum maintainability and scalability.

## Architecture

### Component Structure

```
src/
├── app/
│   └── detail_property/
│       └── page.tsx                    # Main page with routing logic
│
└── components/
    └── detail-property/
        ├── index.ts                     # Central export point
        ├── Overview.tsx                 # General property description
        ├── UnitAnalysis.tsx             # Construction and unit analysis
        ├── MarketStudy.tsx              # Market analysis and transactions
        ├── LotSimulation.tsx            # POT and development simulation
        └── Owners.tsx                   # Property owners and demographics
```

### Design Patterns Applied

#### 1. **Component Pattern**
Each section is an independent, reusable component with its own responsibility.

```typescript
// Clean, focused components
<Overview data={propertyDetails} propertyData={decryptedData} />
<UnitAnalysis data={propertyDetails} />
<MarketStudy data={propertyDetails} />
```

#### 2. **Single Responsibility Principle (SRP)**
Each component handles only one specific aspect of the property information:
- **Overview**: General property characteristics
- **UnitAnalysis**: Construction details and units
- **MarketStudy**: Market analysis and transactions
- **LotSimulation**: POT regulations and development potential
- **Owners**: Ownership information and demographics

#### 3. **Open/Closed Principle (OCP)**
Components are open for extension but closed for modification. New data types can be added without changing existing code.

#### 4. **Dependency Inversion Principle (DIP)**
Components depend on abstractions (props interfaces) rather than concrete implementations.

```typescript
interface OverviewProps {
  data: {
    data_caracteristicas?: any;
    data_lote_polygon?: any;
    data_prediales_actuales?: any;
  };
  propertyData?: {
    id: string;
    address: string;
    barmanpre?: string;
  };
}
```

## Component Details

### 1. Overview Component

**Purpose**: Display general property description and key characteristics

**Features**:
- Property identification (barmanpre, address)
- Physical characteristics (areas, age)
- Cadastral information (appraisal values)
- Location details (neighborhood, locality)

**Data Sources**:
- `data_caracteristicas`: Property characteristics
- `data_prediales_actuales`: Tax and cadastral data
- `propertyData`: Decrypted token data

**Visual Design**:
- Gradient header (purple-pink)
- Icon-based cards (Home, MapPin, Layers, Calendar, DollarSign)
- Responsive grid layout
- Empty state for missing data

### 2. UnitAnalysis Component

**Purpose**: Detailed analysis of construction and units

**Features**:
- Construction details (built area, land area)
- Construction index calculation
- Lot polygon data
- Construction licenses

**Data Sources**:
- `data_caracteristicas`: Basic construction data
- `data_lote_polygon`: Geometric data
- `data_licencias`: License information

**Visual Design**:
- Gradient header (blue-cyan)
- Building icon cards
- Metric cards with color coding
- License list with badges

### 3. MarketStudy Component

**Purpose**: Market analysis and transaction history

**Features**:
- Market analysis (average m² value, market value)
- Neighborhood statistics (min, max, average)
- Transaction history (last 10 transactions)
- Reporting data

**Data Sources**:
- `data_market`: Property market data
- `data_market_barrio`: Neighborhood statistics
- `data_transacciones`: Transaction history
- `data_reporting_barrio`: Area reports

**Visual Design**:
- Gradient header (green-emerald)
- Currency formatted values
- Transaction cards with hover effects
- Color-coded metrics

### 4. LotSimulation Component

**Purpose**: POT regulations and development potential analysis

**Features**:
- Development potential calculator
- Construction index visualization
- POT normative information
- CTL (Local Technical Committee) data

**Data Sources**:
- `data_pot`: POT regulations
- `data_caracteristicas`: Areas for calculations
- `data_ctl`: Committee data

**Calculations**:
```typescript
potencialConstruccion = areaTerreno × indiceConstruccion
porcentajeUsado = (areaActual / potencialConstruccion) × 100
```

**Visual Design**:
- Gradient header (indigo-purple)
- Progress bar for usage percentage
- Wand2 icon for simulation theme
- Warning badges for important data

### 5. Owners Component

**Purpose**: Property ownership information and demographics

**Features**:
- Owner list with details
- Ownership percentage
- DANE demographic data (population, households, housing)
- Additional demographic statistics

**Data Sources**:
- `data_propietarios`: Owner information
- `data_dane`: Demographic data

**Visual Design**:
- Gradient header (orange-red)
- User cards with avatars
- Demographic statistics grid
- Color-coded information sections

## Main Page Logic

### State Management

```typescript
const [activeContent, setActiveContent] = useState<string>('overview');
const [propertyDetails, setPropertyDetails] = useState<DetalleBuildingResponse | null>(null);
const [apiCalls, setApiCalls] = useState<ApiCallStatus[]>([...]);
const [isDecrypting, setIsDecrypting] = useState(false);
```

### Flow Diagram

```
User arrives with encrypted token
         ↓
Parse URL parameters
         ↓
Decrypt token (barmanpre)
         ↓
Execute API call (getDetalleBuilding)
         ↓
Store property details in state
         ↓
Render active component
```

### Component Rendering Logic

```typescript
const renderContent = () => {
  // 1. Show decryption loading
  if (isDecrypting) return <LoadingState />;
  
  // 2. Show error if decryption failed
  if (decryptError) return <ErrorState />;
  
  // 3. Show API loading
  if (isLoading) return <APILoadingState />;
  
  // 4. Render active component
  switch (activeContent) {
    case 'overview': return <Overview />;
    case 'unit-analysis': return <UnitAnalysis />;
    case 'market-study': return <MarketStudy />;
    case 'lot-simulation': return <LotSimulation />;
    case 'owners': return <Owners />;
    case 'new-search': return <NewSearchPrompt />;
  }
};
```

## API Integration

### Endpoint

```typescript
POST /getDetalleBuilding
```

### Request Payload

```typescript
{
  barmanpre: string,        // Property ID
  get_table: true,          // Get table data
  get_tabla_last_year: true // Get last year data
}
```

### Response Structure

```typescript
interface DetalleBuildingResponse {
  data_caracteristicas: any;      // Property characteristics
  data_lote_polygon: any;         // Lot geometry
  data_prediales_actuales?: any;  // Tax data
  data_transacciones?: any;       // Transactions
  data_propietarios?: any;        // Owners
  data_pot?: any;                 // POT regulations
  data_dane?: any;                // Demographics
  data_ctl?: any;                 // CTL data
  data_licencias?: any;           // Licenses
  data_market?: any;              // Market analysis
  data_market_barrio?: any;       // Neighborhood market
  data_reporting_barrio?: any;    // Area reports
}
```

## Responsive Design

### Mobile View
- Hamburger menu for navigation
- Stacked cards
- Full-width components
- Touch-friendly interactions

### Tablet View
- Side menu with icons
- 2-column grid layouts
- Optimized spacing

### Desktop View
- Horizontal menu bar with full labels
- 3-4 column grids
- Expanded data visualization
- Hover effects

## Performance Optimizations

### 1. **Code Splitting**
Each component is in a separate file, allowing Next.js to split the bundle automatically.

### 2. **Lazy Loading**
Components are only rendered when their menu item is selected.

### 3. **Suspense Boundaries**
Main page wrapped in Suspense for better loading UX.

```typescript
<Suspense fallback={<LoadingFallback />}>
  <DetailPropertyContent />
</Suspense>
```

### 4. **Conditional Rendering**
Data sections only render when data is available.

```typescript
{hasData && <DataSection />}
{!hasData && <EmptyState />}
```

## Error Handling

### Three Levels of Error Handling

1. **Decryption Errors**
   - Invalid token format
   - Empty decrypted data
   - User-friendly error messages

2. **API Errors**
   - Network failures
   - Server errors
   - Fallback to mock data for development

3. **Data Errors**
   - Missing required fields
   - Invalid data types
   - Graceful degradation with empty states

## Accessibility

### ARIA Labels
All interactive elements have appropriate ARIA labels.

### Keyboard Navigation
Full keyboard support for menu navigation and component interaction.

### Screen Reader Support
Semantic HTML and proper heading hierarchy.

### Color Contrast
All text meets WCAG AA standards for contrast.

## Testing Strategy

### Unit Tests
```typescript
// Test individual components
describe('Overview Component', () => {
  it('should render property information', () => {
    // Test implementation
  });
  
  it('should handle missing data gracefully', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// Test component integration
describe('Detail Property Page', () => {
  it('should switch between components', () => {
    // Test implementation
  });
  
  it('should load and display API data', () => {
    // Test implementation
  });
});
```

### E2E Tests
```typescript
// Test full user flow
describe('Property Detail Flow', () => {
  it('should complete full property viewing flow', () => {
    // Test implementation
  });
});
```

## Future Enhancements

### Planned Features

1. **Interactive Maps**
   - Leaflet integration for property location
   - Neighborhood boundary visualization
   - Nearby properties markers

2. **Charts and Graphs**
   - Price history timeline
   - Market trends visualization
   - Comparison charts

3. **Export Functionality**
   - PDF report generation
   - Excel data export
   - Share functionality

4. **Advanced Filters**
   - Filter transaction history
   - Sort market data
   - Custom date ranges

5. **Comparison Mode**
   - Compare multiple properties
   - Side-by-side view
   - Difference highlighting

## Maintenance Guidelines

### Adding New Components

1. Create new component in `src/components/detail-property/`
2. Define clear prop interface
3. Add to `index.ts` exports
4. Add case in `renderContent()` switch
5. Update ResponsiveMenu items if needed
6. Write unit tests
7. Update this documentation

### Modifying Existing Components

1. Maintain backward compatibility
2. Update prop interfaces if needed
3. Update unit tests
4. Test responsive behavior
5. Update documentation

### Code Style Guidelines

- Use TypeScript for type safety
- Follow functional component patterns
- Use hooks for state management
- Keep components under 300 lines
- Extract reusable logic into custom hooks
- Use meaningful variable names
- Add JSDoc comments for complex logic

## References

- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Component Patterns](https://reactpatterns.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Maintained By**: Urbex Development Team

