/**
 * API Detail Property Configuration
 * 
 * Configuración y funciones para las APIs del detalle de propiedades
 * Incluye llamadas para obtener detalles, análisis y estudios de mercado
 */

import { API_CONFIG } from './api';

// Tipos para las respuestas de las APIs
export interface DetailBuildingResponse {
  data_caracteristicas: any;
  data_lote_polygon: any;
  data_prediales_actuales?: any;
  data_transacciones?: any;
  data_propietarios?: any;
  data_pot?: any;
  data_dane?: any;
  data_ctl?: any;
  data_licencias?: any;
  data_market?: any;
  data_market_barrio?: any;
  data_reporting_barrio?: any;
}

export interface DetailUnitResponse {
  data_prediales_actuales: any;
  data_transacciones: any;
  data_propietarios: any;
  data_ctl: any;
}

export interface MarketStudyResponse {
  data_polygon_radio: any;
  data_transacciones: any;
  data_prediales: any;
  data_market: any;
}

export interface BatchDevelopmentSimulationResponse {
  data_caracteristicas: any;
  data_lote_polygon: any;
  data_prediales_actuales: any;
  data_pot: any;
  data_propietarios: any;
  data_snr_estadisticas: any;
  data_proyectos_nuevos: any;
}

export interface OwnersResponse {
  data_caracteristicas: any;
  data_prediales_actuales: any;
  data_propietarios: any;
}

// Configuración de endpoints
const ENDPOINTS = {
  GET_DETALLE_BUILDING: '/getDetalleBuilding',
  GET_DETALLE_UNIDAD: '/getDetalleUnidad',
  GET_ESTUDIO_MERCADO: '/getEstudioMercado',
  GET_SIMULACION_BATCH_DEVELOPMENT: '/getDetalleCabida',
  GET_PROPIETARIOS: '/getDetallePropietarios',
} as const;

/**
 * Función auxiliar para realizar peticiones HTTP
 */
async function makeApiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.PROPERTIES_DETAIL_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${endpoint}`, data);
    
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Obtener detalles de una propiedad
 */
export async function getDetailBuilding(propertyId: string): Promise<DetailBuildingResponse> {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  const inputvar = {
    barmanpre: propertyId,
    get_table: true,
    get_tabla_last_year: true
  }

  const endpoint = `${ENDPOINTS.GET_DETALLE_BUILDING}`;
  
  try {
    const response = await makeApiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inputvar),
    });
    const responseData = response['data'];
    const dataBuilding = {
      data_caracteristicas: {},
      data_lote_polygon: {},
      data_prediales_actuales: {},
      data_transacciones: {},
      data_propietarios: {},
      data_pot: {},
      data_dane: {},
      data_ctl: {},
      data_licencias: {},
      data_market: {},
      data_market_barrio: {},
      data_reporting_barrio: {},
    };
    
    dataBuilding['data_caracteristicas'] = responseData['lotes_caracteristicas'];
    dataBuilding['data_lote_polygon'] = responseData['lotes_construcciones'];
    dataBuilding['data_prediales_actuales'] = responseData['prediales'];
    dataBuilding['data_transacciones'] = responseData['transacciones'];
    dataBuilding['data_propietarios'] = responseData['propietarios'];
    dataBuilding['data_pot'] = responseData['pot_bogota'];
    dataBuilding['data_dane'] = responseData['dane'];
    dataBuilding['data_ctl'] = responseData['ctl'];
    dataBuilding['data_licencias'] = responseData['licencias_construccion'];
    dataBuilding['data_market'] = responseData['market_analysis'];
    dataBuilding['data_market_barrio'] = responseData['market_statistics'];
    dataBuilding['data_reporting_barrio'] = responseData['reportingBarrio'];

    console.log('🔍 Response dataBuilding:', dataBuilding);
    return dataBuilding;
  } catch (error) {
    console.error('Error fetching property details:', error);
    
    // Retornar datos mock en caso de error para desarrollo
    return {
      data_caracteristicas: {},
      data_lote_polygon: {},
      data_prediales_actuales: {},
      data_transacciones: {},
      data_propietarios: {},
      data_pot: {},
      data_dane: {},
      data_ctl: {},
      data_licencias: {},
      data_market: {},
      data_market_barrio: {},
      data_reporting_barrio: {},
    };
  }
}

/**
 * Obtener detalles de una unidad
 */
export async function getDetailUnit(propertyId: string): Promise<DetailUnitResponse> {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  const inputvar = {
    barmanpre: propertyId,
    get_table: true,
    get_tabla_last_year: false
  }
  const endpoint = `${ENDPOINTS.GET_DETALLE_UNIDAD}`;
  try {
    const response = await makeApiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inputvar),
    });
    const responseData = response['data'];
    const dataUnit = {
      data_prediales_actuales: {},
      data_transacciones: {},
      data_propietarios: {},
      data_ctl: {},
    };
    dataUnit['data_prediales_actuales'] = responseData['prediales'];
    dataUnit['data_transacciones'] = responseData['transacciones'];
    dataUnit['data_propietarios'] = responseData['propietarios'];
    dataUnit['data_ctl'] = responseData['ctl'];
    console.log('🔍 Response dataUnit:', dataUnit);
    return dataUnit;
  } catch (error) {
    console.error('Error fetching property details:', error);
    return {
      data_prediales_actuales: {},
      data_transacciones: {},
      data_propietarios: {},
      data_ctl: {},
    };
  }
}

/**
 * Obtener estudio de mercado
 */
export async function getMarketStudy(propertyId: string): Promise<MarketStudyResponse> {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  const inputvar = {
    barmanpre: propertyId,
    table: 'bogota_data_lotes_fastsearch',
    get_table: false,
    get_tabla_last_year: false
  }
  const endpoint = `${ENDPOINTS.GET_ESTUDIO_MERCADO}`;
  try {
    const response = await makeApiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inputvar),
    });
    const responseData = response['data'];
    const dataMarket = {
      data_polygon_radio: {},
      data_transacciones: {},
      data_prediales: {},
      data_market: {},
    };
    dataMarket['data_polygon_radio'] = responseData['lotes_polygon'];
    dataMarket['data_transacciones'] = responseData['transacciones_polygon'];
    dataMarket['data_prediales'] = responseData['prediales_polygon'];
    dataMarket['data_market'] = responseData['market_analysis'];
    console.log('🔍 Response dataMarket:', dataMarket);
    return dataMarket;
  } catch (error) {
    console.error('Error fetching market study:', error);
    return {
      data_polygon_radio: {},
      data_transacciones: {},
      data_prediales: {},
      data_market: {},
    };
  }
}

/**
 * Obtener simulación de batch development
*/
export async function getBatchDevelopmentSimulation(propertyId: string): Promise<BatchDevelopmentSimulationResponse> {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  const inputvar = {
    barmanpre: propertyId
  }
  const endpoint = `${ENDPOINTS.GET_SIMULACION_BATCH_DEVELOPMENT}`;
  try {
    const response = await makeApiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inputvar),
    });
    const responseData = response['data'];
    const dataBatchDevelopment = {
      data_caracteristicas: {},
      data_lote_polygon: {},
      data_prediales_actuales: {},
      data_pot: {},
      data_propietarios: {},
      data_snr_estadisticas: {},
      data_proyectos_nuevos: {},
    };
    dataBatchDevelopment['data_caracteristicas'] = responseData['lotes_caracteristicas'];
    dataBatchDevelopment['data_lote_polygon'] = responseData['lotes_construcciones'];
    dataBatchDevelopment['data_prediales_actuales'] = responseData['prediales'];
    dataBatchDevelopment['data_pot'] = responseData['pot_bogota'];
    dataBatchDevelopment['data_propietarios'] = responseData['propietarios'];
    dataBatchDevelopment['data_snr_estadisticas'] = responseData['transacciones_polygon'];
    dataBatchDevelopment['data_proyectos_nuevos'] = responseData['market_proyectos'];
    
    console.log('🔍 Response dataBatchDevelopment:', dataBatchDevelopment);
    return dataBatchDevelopment;
  } catch (error) {
    console.error('Error fetching batch development simulation:', error);
    return {
      data_caracteristicas: {},
      data_lote_polygon: {},
      data_prediales_actuales: {},
      data_pot: {},
      data_propietarios: {},
      data_snr_estadisticas: {},
      data_proyectos_nuevos: {},
    };
  }
}

/**
 * Obtener propietarios
 */
export async function getOwners(propertyId: string): Promise<OwnersResponse> {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  const inputvar = {
    barmanpre: propertyId,
    get_table: true,
    get_tabla_last_year: false
  }
  const endpoint = `${ENDPOINTS.GET_PROPIETARIOS}`;
  try {
    const response = await makeApiRequest<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inputvar),
    });
    const responseData = response['data'];
    const dataOwners = {
      data_caracteristicas: {},
      data_prediales_actuales: {},
      data_propietarios: {},
    };
    dataOwners['data_caracteristicas'] = responseData['lotes_caracteristicas'];
    dataOwners['data_prediales_actuales'] = responseData['prediales'];
    dataOwners['data_propietarios'] = responseData['propietarios'];
    console.log('🔍 Response dataOwners:', dataOwners);
    return dataOwners;
  } catch (error) {
    console.error('Error fetching owners:', error);
    return {
      data_caracteristicas: {},
      data_prediales_actuales: {},
      data_propietarios: {},
    };
  }
}