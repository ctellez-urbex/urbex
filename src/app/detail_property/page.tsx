'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResponsiveMenu, { MenuItem } from '@/components/ui/responsive-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { decryptBarmanpre } from '@/lib/encryption';
import { 
  getDetailBuilding, 
  getDetailUnit,
  getMarketStudy,
  getBatchDevelopmentSimulation,
  getOwners,
  DetailBuildingResponse,
  DetailUnitResponse,
  MarketStudyResponse,
  BatchDevelopmentSimulationResponse,
  OwnersResponse,
} from '@/config/api-detail-property';
import { Loader2, AlertCircle, CheckCircle, Clock, Home } from 'lucide-react';
import { 
  Overview, 
  UnitAnalysis, 
  MarketStudy, 
  LotSimulation, 
  Owners 
} from '@/components/detail-property';

// Tipos para los datos de la propiedad
interface PropertyData {
  id: string;
  address: string;
  estrato?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: {
    min: number;
    max: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  barmanpre?: string;
  [key: string]: any;
}

interface ApiCallStatus {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
}

// Componente principal de contenido
function DetailPropertyContent() {
  const searchParams = useSearchParams();
  const [activeContent, setActiveContent] = useState<string>('overview');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<PropertyData | null>(null);
  
  // Separate states for each API response
  const [buildingDetails, setBuildingDetails] = useState<DetailBuildingResponse | null>(null);
  const [unitDetails, setUnitDetails] = useState<DetailUnitResponse | null>(null);
  const [marketStudy, setMarketStudy] = useState<MarketStudyResponse | null>(null);
  const [batchDevelopmentSimulation, setBatchDevelopmentSimulation] = useState<BatchDevelopmentSimulationResponse | null>(null);
  const [owners, setOwners] = useState<OwnersResponse | null>(null);

  const [apiCalls, setApiCalls] = useState<ApiCallStatus[]>([
    { name: 'Building Details', status: 'pending' },
    { name: 'Unit Details', status: 'pending' },
    { name: 'Market Study', status: 'pending' },
    { name: 'Batch Development Simulation', status: 'pending' },
    { name: 'Owners', status: 'pending' },
  ]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Obtener token de localStorage usando la referencia de URL
  useEffect(() => {
    // Intentar obtener token de localStorage primero
    const refParam = searchParams.get('ref');
    
    if (refParam) {
      // Buscar el token en localStorage usando la referencia
      const storedData = localStorage.getItem(refParam);
      
      if (storedData) {
        try {
          const tokenData = JSON.parse(storedData);
          
          // Verificar si el token ha expirado
          if (Date.now() > tokenData.expiresAt) {
            localStorage.removeItem(refParam);
            setDecryptError('El token ha expirado. Por favor, intenta de nuevo desde la página de propiedades.');
            console.error('❌ Token expirado:', {
              createdAt: new Date(tokenData.createdAt),
              expiresAt: new Date(tokenData.expiresAt),
              now: new Date()
            });
            return;
          }
          
          console.log('🔐 Token recuperado de localStorage');
          console.log('⏰ Token válido hasta:', new Date(tokenData.expiresAt));
          
          setToken(tokenData.token);
          handleTokenDecryption(tokenData.token);
          
          // Limpiar localStorage después de usar el token (uso único)
          localStorage.removeItem(refParam);
          console.log('🧹 Token limpiado de localStorage después de uso');
          
        } catch (error) {
          console.error('❌ Error parseando token data:', error);
          setDecryptError('Token inválido. Por favor, intenta de nuevo.');
          localStorage.removeItem(refParam);
        }
      } else {
        setDecryptError('Token no encontrado o ya fue usado. Por favor, intenta de nuevo desde la página de propiedades.');
        console.error('❌ Token no encontrado en localStorage con referencia:', refParam);
        console.log('💡 Tip: Asegúrate de abrir el detalle desde el botón "Ver Detalles"');
      }
    } else {
      // Fallback: verificar si hay un token directo en la URL (para compatibilidad)
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        console.log('⚠️ Usando token de URL (método antiguo)');
        setToken(tokenParam);
        handleTokenDecryption(tokenParam);
      } else {
        setDecryptError('No se encontró referencia de token. Por favor, accede desde la página de propiedades.');
      }
    }
  }, [searchParams]);

  // Función para desencriptar el token
  const handleTokenDecryption = async (encryptedToken: string) => {
    setIsDecrypting(true);
    setDecryptError(null);

    try {
      console.log('🔓 Desencriptando token...');
      const decryptedString = decryptBarmanpre(encryptedToken);
      
      if (!decryptedString) {
        throw new Error('Token desencriptado está vacío');
      }
      
      // El token ahora contiene solo el barmanpre como string simple
      const parsedData: PropertyData = { 
        id: decryptedString, 
        address: 'Dirección no disponible',
        barmanpre: decryptedString
      };

      console.log('✅ Token desencriptado:', parsedData);
      setDecryptedData(parsedData);
      
      // Ejecutar llamadas a las APIs
      await executeApiCalls(parsedData);
      
    } catch (error) {
      console.error('❌ Error desencriptando token:', error);
      setDecryptError('Error al desencriptar el token. Verifique que sea válido.');
    } finally {
      setIsDecrypting(false);
    }
  };

  // Función para ejecutar las llamadas a las APIs con carga progresiva
  const executeApiCalls = async (propertyData: PropertyData) => {
    console.log('🚀 Ejecutando llamadas a APIs con carga progresiva...');

    // PRIMERA FASE: Cargar Building Details inmediatamente para mostrar la página
    console.log('📡 FASE 1: Cargando Building Details...');
    setApiCalls(prev => prev.map((call, index) => 
      index === 0 ? { ...call, status: 'loading' } : call
    ));

    try {
      const buildingResult = await getDetailBuilding(propertyData.id);
      setBuildingDetails(buildingResult);
      setApiCalls(prev => prev.map((call, index) => 
        index === 0 ? { ...call, status: 'success', data: buildingResult } : call
      ));
      
      console.log('✅ Building Details completado - Página lista para mostrar');
      setIsInitialLoadComplete(true); // Marcar que la carga inicial está completa
      
    } catch (error) {
      console.error('❌ Error en Building Details:', error);
      setApiCalls(prev => prev.map((call, index) => 
        index === 0 ? { 
          ...call, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Error desconocido'
        } : call
      ));
      setIsInitialLoadComplete(true); // Mostrar página aunque haya error
    }

    // SEGUNDA FASE: Cargar las demás APIs en segundo plano
    console.log('📡 FASE 2: Cargando APIs adicionales en segundo plano...');
    
    const backgroundApiCalls = [
      {
        name: 'Unit Details',
        apiCall: () => getDetailUnit(propertyData.id),
        setState: setUnitDetails,
        index: 1
      },
      {
        name: 'Market Study',
        apiCall: () => getMarketStudy(propertyData.id),
        setState: setMarketStudy,
        index: 2
      },
      {
        name: 'Batch Development Simulation',
        apiCall: () => getBatchDevelopmentSimulation(propertyData.id),
        setState: setBatchDevelopmentSimulation,
        index: 3
      },
      {
        name: 'Owners',
        apiCall: () => getOwners(propertyData.id),
        setState: setOwners,
        index: 4
      },
    ];

    // Ejecutar APIs adicionales en paralelo
    const backgroundPromises = backgroundApiCalls.map(async (apiCall) => {
      // Actualizar estado a loading
      setApiCalls(prev => prev.map((call, index) => 
        index === apiCall.index ? { ...call, status: 'loading' } : call
      ));

      try {
        console.log(`📡 Ejecutando en segundo plano: ${apiCall.name}`);
        const result = await apiCall.apiCall();
        
        // Store data in corresponding state
        apiCall.setState(result as any);
        
        // Actualizar estado a success
        setApiCalls(prev => prev.map((call, index) => 
          index === apiCall.index ? { ...call, status: 'success', data: result } : call
        ));
        
        console.log(`✅ ${apiCall.name} completado en segundo plano:`, result);
        
      } catch (error) {
        console.error(`❌ Error en ${apiCall.name}:`, error);
        
        // Actualizar estado a error
        setApiCalls(prev => prev.map((call, index) => 
          index === apiCall.index ? { 
            ...call, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Error desconocido'
          } : call
        ));
      }
    });

    // Esperar a que todas las APIs de segundo plano terminen
    await Promise.allSettled(backgroundPromises);
    console.log('🎉 Todas las llamadas a APIs completadas');
  };

  // Manejar clic en elementos del menú
  const handleMenuItemClick = (item: MenuItem) => {
    setActiveContent(item.id);
  };

  // Función para navegar a Análisis de Unidad con un chip seleccionado
  const handleNavigateToUnit = (chip: string) => {
    setSelectedChip(chip);
    setActiveContent('unit-analysis');
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status: ApiCallStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Render active component based on menu selection
  const renderContent = () => {
    if (isDecrypting) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">En pocos segundos estarás viendo la información de la propiedad...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Preparando datos de la propiedad
            </p>
          </div>
        </div>
      );
    }

    if (decryptError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Error al cargar datos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{decryptError}</p>
          </div>
        </div>
      );
    }

    // Solo mostrar loading si Building Details no está listo
    const buildingDetailsCall = apiCalls[0];
    const isBuildingDetailsLoading = buildingDetailsCall?.status === 'loading' || buildingDetailsCall?.status === 'pending';

    if (isBuildingDetailsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Cargando información básica de la propiedad...</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                {getStatusIcon(buildingDetailsCall.status)}
                <span className={buildingDetailsCall.status === 'success' ? 'text-green-600 dark:text-green-400' : ''}>
                  {buildingDetailsCall.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render component based on active content
    // Pass specific data to each component
    switch (activeContent) {
      case 'overview':
        // Descripción General receives DetailBuildingResponse
        return (
          <Overview 
            data={buildingDetails || {}} 
            propertyData={decryptedData || undefined}
            onNavigateToUnit={handleNavigateToUnit}
          />
        );
      
      case 'unit-analysis':
        // Análisis de Unidad receives DetailUnitResponse
        return (
          <UnitAnalysis 
            data={unitDetails || {}}
            initialSelectedChip={selectedChip}
          />
        );
      
      case 'market-study':
        // Estudio de Mercado receives DetailBuildingResponse
        return (
          <MarketStudy 
            data={marketStudy || {}} 
          />
        );
      
      case 'lot-simulation':
        // Simulación de Desarrollo receives DetailBuildingResponse
        return (
          <LotSimulation 
            data={batchDevelopmentSimulation || {}} 
          />
        );
      
      case 'owners':
        // Propietarios receives both responses (has data from both)
        return (
          <Owners 
            data={owners || {}}            
          />
        );
      
      case 'new-search':
        // Nueva Búsqueda - Navigation
        const handleNewSearch = () => {
          // Navegar a la página de propiedades
          window.location.href = '/properties/';
          // Cerrar la ventana actual después de un pequeño delay
          setTimeout(() => {
            window.close();
          }, 100);
        };

        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Home className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nueva Búsqueda</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Navega a la página de propiedades para realizar una nueva búsqueda
              </p>
              <button
                onClick={handleNewSearch}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              >
                Ir a Propiedades
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <Overview 
            data={buildingDetails || {}} 
            propertyData={decryptedData || undefined} 
          />
        );
    }
  };

  // Check if there are APIs still loading in the background
  const backgroundApisLoading = apiCalls.slice(1).some(call => call.status === 'loading' || call.status === 'pending');
  const backgroundApisCount = apiCalls.slice(1).filter(call => call.status === 'loading' || call.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Loading Indicator */}
      {backgroundApisLoading && (
        <div className="sticky top-0 z-50 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando datos adicionales ({backgroundApisCount} APIs pendientes)...</span>
            </div>
          </div>
        </div>
      )}

      {/* Header with Theme Toggle */}
      <div className={`sticky ${backgroundApisLoading ? 'top-[41px]' : 'top-0'} z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Responsive Menu - Positioned below header */}
      <div className={`sticky ${backgroundApisLoading ? 'top-[98px]' : 'top-[57px]'} z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
        <div className="container mx-auto px-4 py-2">
          <ResponsiveMenu 
            onItemClick={handleMenuItemClick}
            activeItemId={activeContent}
          />
        </div>
      </div>

      {/* Main Content Area - Below Menu */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function DetailPropertyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando detalle de propiedad...</span>
        </div>
      </div>
    }>
      <DetailPropertyContent />
    </Suspense>
  );
}
