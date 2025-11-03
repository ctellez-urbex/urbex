/**
 * Properties Page
 * 
 * Main page for property search and visualization
 */

'use client';

import { useState, useEffect } from 'react';
import { PropertySearchForm, PropertySearchFilters } from '@/components/properties/PropertySearchForm';
import { CleanMapSearch } from '@/components/properties/CleanMapSearch';
import { searchProperties, convertFiltersToApiRequest, PropertyData } from '@/config/api-properties';
import { encryptBarmanpre, testEncryption } from '@/lib/encryption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Map, Search, AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <PropertiesPageContent />
    </ProtectedRoute>
  );
}

function PropertiesPageContent() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<PropertySearchFilters | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    // Test encryption in development mode
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('🧪 Testing encryption system...');
        testEncryption('TEST_BARMAN_123');
      }, 1000);
    }
  }, []);

  const handlePropertySelect = (property: PropertyData | null) => {
    setSelectedProperty(property);
    
    // Scroll to the selected property in the list
    if (property) {
      setTimeout(() => {
        const element = document.getElementById(`property-${property.id}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  };

  const handleFiltersChange = (filters: PropertySearchFilters) => {
    // Update current filters whenever form values change
    console.log('🔄 Form filters changed:', filters);
    console.log('🔄 Form filter details:');
    console.log('  - Property Types:', filters.propertyTypes);
    console.log('  - Area Min:', filters.areaMin);
    console.log('  - Area Max:', filters.areaMax);
    console.log('  - Stratum Min:', filters.stratumMin);
    console.log('  - Stratum Max:', filters.stratumMax);
    console.log('  - Construction Year Min:', filters.constructionYearMin);
    console.log('  - Construction Year Max:', filters.constructionYearMax);
    setCurrentFilters(filters);
  };

  const handleSearch = async (filters: PropertySearchFilters) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      console.log('🔍 Searching properties with filters:', filters);
      
      // Convert filters to API request format
      const apiRequest = convertFiltersToApiRequest(filters);
      console.log('📡 API Request:', apiRequest);

      // Call the search API
      const response = await searchProperties(apiRequest);
      console.log('📊 API Response:', response);

      if (response.success && response.data) {
        setProperties(response.data);
        // Store search results in sessionStorage for detail page access
        sessionStorage.setItem('searchResults', JSON.stringify(response.data));
        console.log(`✅ Found ${response.data.length} properties`);
      } else {
        setError(response.error || 'Error al buscar propiedades');
        setProperties([]);
        // Clear stored results on error
        sessionStorage.removeItem('searchResults');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado al buscar propiedades');
      setProperties([]);
      // Clear stored results on error
      sessionStorage.removeItem('searchResults');
    } finally {
      setLoading(false);
    }
  };

  const handlePolygonSearch = async (polygon: string, filters?: PropertySearchFilters) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      console.log('🗺️ Searching with polygon:', polygon);
      console.log('🔍 Filters received from map:', filters);
      console.log('🔍 Current filters state:', currentFilters);
      
      // Use filters passed from map, or current filters, or default values
      const filtersToUse = filters || currentFilters || {
        searchType: 'polygon',
        propertyTypes: ['Todos'],
        areaMin: '',
        areaMax: '',
        stratumMin: '',
        stratumMax: '',
        constructionYearMin: '',
        constructionYearMax: '',
        city: '',
        address: '',
        chip: '',
        matricula: '',
        copropiedad: ''
      };

      // Combine filters with polygon
      const combinedFilters = {
        ...filtersToUse,
        searchType: 'polygon',
        polygon
      };

      console.log('🔍 Combined filters for polygon search:', combinedFilters);
      console.log('🔍 Individual filter values:');
      console.log('  - Property Types:', combinedFilters.propertyTypes);
      console.log('  - Area Min:', combinedFilters.areaMin);
      console.log('  - Area Max:', combinedFilters.areaMax);
      console.log('  - Stratum Min:', combinedFilters.stratumMin);
      console.log('  - Stratum Max:', combinedFilters.stratumMax);
      console.log('  - Construction Year Min:', combinedFilters.constructionYearMin);
      console.log('  - Construction Year Max:', combinedFilters.constructionYearMax);
      console.log('  - Polygon:', combinedFilters.polygon);
      
      const apiRequest = convertFiltersToApiRequest(combinedFilters);

      const response = await searchProperties(apiRequest);

      if (response.success && response.data) {
        setProperties(response.data);
        // Store search results in sessionStorage for detail page access
        sessionStorage.setItem('searchResults', JSON.stringify(response.data));
        console.log(`✅ Found ${response.data.length} properties in polygon with filters`);
      } else {
        setError(response.error || 'Error al buscar propiedades en el polígono');
        // Clear stored results on error
        sessionStorage.removeItem('searchResults');
      }
    } catch (err) {
      console.error('❌ Polygon search error:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado al buscar propiedades');
      // Clear stored results on error
      sessionStorage.removeItem('searchResults');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Búsqueda de Propiedades
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Encuentra propiedades inmobiliarias en Bogotá usando diferentes criterios de búsqueda
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <PropertySearchForm
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Map and Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <CleanMapSearch
              properties={properties}
              onPolygonSearch={handlePolygonSearch}
              onPropertySelect={handlePropertySelect}
              selectedProperty={selectedProperty}
              currentFilters={currentFilters}
              loading={loading}
            />
            
            {/* Search Tips - Only in map column */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Consejos de búsqueda</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                <p>• <strong>🔵 Líneas azules:</strong> Se dibujan entre puntos mientras creas el polígono</p>
                <p>• <strong>🔵 Área azul:</strong> Vista previa y resultado final del polígono</p>
                <p>• <strong>🔵 Recuadros azules:</strong> Propiedades encontradas en el área</p>
                <p>• <strong>Auto-cierre:</strong> Haz clic cerca del primer punto para cerrar automáticamente</p>
                <p>• <strong>Nueva Búsqueda:</strong> Después de buscar, usa este botón para empezar de nuevo</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Buscando...</p>
                  </div>
                ) : properties.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Se encontraron <strong>{properties.length}</strong> propiedades
                    </p>
                    
                    {/* Property List */}
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {properties.map((property) => (
                        <div
                          key={property.id}
                          id={`property-${property.id}`}
                          className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                            selectedProperty?.id === property.id 
                              ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600' 
                              : ''
                          }`}
                          onClick={() => {
                            handlePropertySelect(property);
                          }}
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{property.formato_direccion}</p>
                            <p className="text-xs text-gray-500">
                              {property.prenbarrio}, {property.locnombre}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Estrato {property.estrato}</span>
                              <span>{property.preaconst.toFixed(0)} m²</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Selected Property Details */}
                    {selectedProperty && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                            Propiedad Seleccionada
                          </h4>
                          <button
                            onClick={() => {                              
                              // Encriptar el barmanpre
                              const encryptedToken = encryptBarmanpre(selectedProperty.barmanpre);
                              
                              // Guardar en localStorage con tiempo de expiración
                              const storageKey = `property_token_${Date.now()}`;
                              const tokenData = {
                                token: encryptedToken,
                                expiresAt: Date.now() + 60000, // Expira en 60 segundos
                                createdAt: Date.now()
                              };
                              
                              localStorage.setItem(storageKey, JSON.stringify(tokenData));
                              
                              // Construir URL sin el token visible
                              const detailUrl = `/detail_property/?ref=${storageKey}`;
                              
                              console.log('🚀 Abriendo detalle de propiedad:', selectedProperty.barmanpre);
                              console.log('🔐 Token guardado en localStorage con key:', storageKey);
                              console.log('⏰ Token expira en 60 segundos');
                              
                              // Abrir en nueva ventana
                              window.open(detailUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                              
                              // Limpiar localStorage después de 60 segundos (por seguridad)
                              setTimeout(() => {
                                localStorage.removeItem(storageKey);
                                console.log('🧹 Token limpiado de localStorage');
                              }, 60000);
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            Ver Detalles
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Dirección:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.formato_direccion}</p>
                            </div>
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Estrato:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.estrato}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300 font-medium">Ubicación:</p>
                            <p className="text-blue-900 dark:text-blue-100">{selectedProperty.prenbarrio}, {selectedProperty.locnombre}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Área construida:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.preaconst.toFixed(0)} m²</p>
                            </div>
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Área terreno:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.preaterre.toFixed(0)} m²</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Predios:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.predios}</p>
                            </div>
                            <div>
                              <p className="text-blue-700 dark:text-blue-300 font-medium">Pisos:</p>
                              <p className="text-blue-900 dark:text-blue-100">{selectedProperty.connpisos || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300 font-medium">Año construcción:</p>
                            <p className="text-blue-900 dark:text-blue-100">{selectedProperty.prevetustzmin} - {selectedProperty.prevetustzmax}</p>
                          </div>
                          <div>
                            <p className="text-blue-700 dark:text-blue-300 font-medium">Matrícula:</p>
                            <p className="text-blue-900 dark:text-blue-100 font-mono">{selectedProperty.barmanpre}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {searchPerformed 
                        ? 'No se encontraron propiedades con los criterios especificados'
                        : 'Usa el formulario de búsqueda para encontrar propiedades'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}
