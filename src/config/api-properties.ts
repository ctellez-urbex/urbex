/**
 * Properties API Configuration
 * 
 * Handles all property-related API calls including:
 * - Property search by various criteria
 * - Property details retrieval via external API
 * 
 * @example Basic Usage:
 * ```typescript
 * // Search for properties
 * const searchResult = await searchProperties({
 *   tipoinmueble: ['Apartamento'],
 *   areamin: 50,
 *   areamax: 200
 * });
 * 
 * // Get property details from external API
 * const detailResult = await getPropertyDetails('BARMAN123');
 * if (detailResult.success) {
 *   console.log('Property:', detailResult.data);
 * }
 * ```
 */

import { API_CONFIG } from './api';

// Types for property search
export interface PropertySearchRequest {
  tipoinmueble: string[];
  areamin: number | null;
  areamax: number | null;
  antiguedadmin: number | null;
  max_age: number | null;
  estratomin: number | null;
  estratomax: number | null;
  polygon?: string | null;
  address?: string | null;
  chip?: string | null;
  matricula?: string | null;
  copropiedad?: string | null;
}

export interface PropertyData {
  id: number;
  barmanpre: string;
  preaconst: number;
  preaterre: number;
  prevetustzmin: number;
  prevetustzmax: number;
  estrato: number;
  predios: number;
  connpisos: number | null;
  connsotano: number | null;
  contsemis: number | null;
  conelevaci: number | null;
  formato_direccion: string;
  nombre_conjunto: string;
  prenbarrio: string;
  precbarrio: string;
  locnombre: string;
  preusoph: string;
  manzcodigo: string;
  esquinero: number;
  viaprincipal: number;
  lista_precuso: string;
  lista_precdestin: string;
  wkt: string;
}

export interface PropertySearchResponse {
  success: boolean;
  message?: string;
  data?: PropertyData[];
  total?: number;
  limit?: number;
  offset?: number;
  meta?: {
    timestamp: string;
    request_id: string;
    filters_applied: any;
  };
  error?: string;
}



/**
 * Search properties using the general search API
 * 
 * @param searchRequest - Search parameters
 * @returns Promise with search results
 */
export async function searchProperties(
    searchRequest: PropertySearchRequest,
    token?: string
): Promise<PropertySearchResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.PROPERTIES_API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const url = API_CONFIG.PROPERTIES_BASE_URL + `/search/general`;
    console.log('📤 Request body !!!!*****:', JSON.stringify(searchRequest, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Cambiar a await response.json()
    console.log('📊 API Response:', data);
    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('Property Search API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar propiedades'
    };
  }
}


/**
 * Get detailed information for a specific property
 * 
 * Makes a direct API call to retrieve property details from external API.
 * 
 * @param barmanpre - ID of the property to get details for
 * @param token - Optional authentication token
 * @returns Promise with property details
 */
export async function getPropertyDetails(
    barmanpre: string,
    token?: string
): Promise<PropertySearchResponse> {
  try {
    console.log('🔍 Getting property details for barmanpre:', barmanpre);
    console.log('🔐 Token provided:', token ? 'Yes' : 'No');
    
    // Prepare headers for the API request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.PROPERTIES_API_KEY,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make direct API call to get property details
    const url = `${API_CONFIG.NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL}/property/${barmanpre}`;
    console.log('📤 Making API request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url
      });
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Property Details API Response:', data);

    // Check if the response contains property data
    if (data && (data.data || data.barmanpre)) {
      const propertyData = data.data || data;
      
      return {
        success: true,
        data: Array.isArray(propertyData) ? propertyData : [propertyData],
        message: 'Property details retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          request_id: `property-detail-${barmanpre}-${Date.now()}`,
          filters_applied: { barmanpre }
        }
      };
    } else {
      console.log('❌ Property not found in API response');
      return {
        success: false,
        error: 'Property not found'
      };
    }
    
  } catch (error) {
    console.error('❌ Property Details API Error:', error);
    
    // If API call fails, fallback to search method as backup
    console.log('🔄 Falling back to search method...');
    try {
      const searchRequest = {
        tipoinmueble: ['Todos'],
        areamin: null,
        areamax: null,
        antiguedadmin: null,
        max_age: null,
        estratomin: null,
        estratomax: null,
        barmanpre: barmanpre
      };

      const searchResponse = await searchProperties(searchRequest, token);
      
      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        const exactMatch = searchResponse.data.find(p => p.barmanpre === barmanpre);
        if (exactMatch) {
          console.log('✅ Found property through fallback search API');
          return {
            success: true,
            data: [exactMatch],
            message: 'Property found through fallback search'
          };
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback search also failed:', fallbackError);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error retrieving property details'
    };
  }
}


/**
 * Convert search filters to API request format
 * 
 * @param filters - Search filters from the form
 * @returns API request object
 */
export function convertFiltersToApiRequest(filters: any): PropertySearchRequest {
  console.log('🔧 Converting filters to API request:', filters);
  
  // Helper function to convert empty strings to null
  const convertEmptyToNull = (value: any) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    return value;
  };

  // Helper function to convert to number or null
  const convertToNumberOrNull = (value: any) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const apiRequest = {
    tipoinmueble: filters.propertyTypes && filters.propertyTypes.length > 0 ? filters.propertyTypes : ['Todos'],
    areamin: convertToNumberOrNull(filters.areaMin),
    areamax: convertToNumberOrNull(filters.areaMax),
    antiguedadmin: convertToNumberOrNull(filters.constructionYearMin),
    max_age: convertToNumberOrNull(filters.constructionYearMax),
    estratomin: convertToNumberOrNull(filters.stratumMin),
    estratomax: convertToNumberOrNull(filters.stratumMax),
    polygon: convertEmptyToNull(filters.polygon),
    address: convertEmptyToNull(filters.address),
    chip: convertEmptyToNull(filters.chip),
    matricula: convertEmptyToNull(filters.matricula),
    copropiedad: convertEmptyToNull(filters.copropiedad)
  };

  console.log('📡 Final API request being sent to server:');
  console.log('  - Property Types:', apiRequest.tipoinmueble);
  return apiRequest;
}
