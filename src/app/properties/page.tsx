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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<PropertySearchFilters | null>(null);

  useEffect(() => {
    // Test encryption in development mode
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('🧪 Testing encryption system...');
        testEncryption('TEST_BARMAN_123');
      }, 1000);
    }
  }, []);

  const handlePropertySelect = (property: PropertyData | null) => {
    if (property) {
      setSelectedProperty(property);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleVerDetalles = () => {
    if (!selectedProperty) return;

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

        {/* Map Section */}
        <div className="w-full">
          <CleanMapSearch
            properties={properties}
            onPolygonSearch={handlePolygonSearch}
            onPropertySelect={handlePropertySelect}
            selectedProperty={selectedProperty}
            currentFilters={currentFilters}
            loading={loading}
          />
        </div>

        {/* Property Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedProperty ? "Información de la Propiedad" : ""}
        >
          {selectedProperty && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Dirección:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.formato_direccion}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Estrato:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.estrato}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Ubicación:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.prenbarrio}, {selectedProperty.locnombre}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Área construida:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.preaconst.toFixed(0)} m²</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Área terreno:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.preaterre.toFixed(0)} m²</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Predios:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.predios}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Pisos:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.connpisos || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Año construcción:</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.prevetustzmin} - {selectedProperty.prevetustzmax}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Matrícula:</p>
                  <p className="text-xs text-gray-900 dark:text-white font-mono">{selectedProperty.barmanpre}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                <Button
                  onClick={handleVerDetalles}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
