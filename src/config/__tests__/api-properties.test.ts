/**
 * Properties API Tests
 */

import { searchProperties, convertFiltersToApiRequest } from '../api-properties';

// Mock the API_CONFIG
jest.mock('../api', () => ({
  API_CONFIG: {
    PROPERTIES_API_BASE_URL: 'https://test-api.com',
    API_KEY: 'test-api-key'
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('Properties API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.ENV for development mode
    Object.defineProperty(window, 'ENV', {
      value: { NODE_ENV: 'development' },
      writable: true
    });
  });

  describe('convertFiltersToApiRequest', () => {
    it('converts filters to API request format correctly', () => {
      const filters = {
        searchType: 'polygon',
        propertyTypes: ['residencial', 'comercio'],
        areaMin: 100,
        areaMax: 500,
        stratumMin: 3,
        stratumMax: 6,
        constructionYearMin: 2000,
        constructionYearMax: 2020,
        polygon: 'POLYGON((...))'
      };

      const result = convertFiltersToApiRequest(filters);

      expect(result).toEqual({
        tipoinmueble: ['residencial', 'comercio'],
        areamin: 100,
        areamax: 500,
        antiguedadmin: 2000,
        max_age: 2020,
        estratomin: 3,
        estratomax: 6,
        polygon: 'POLYGON((...))',
        address: undefined,
        chip: undefined,
        matricula: undefined,
        copropiedad: undefined
      });
    });

    it('handles empty values correctly', () => {
      const filters = {
        searchType: 'polygon',
        propertyTypes: ['Todos'],
        areaMin: '',
        areaMax: '',
        stratumMin: '',
        stratumMax: '',
        constructionYearMin: '',
        constructionYearMax: ''
      };

      const result = convertFiltersToApiRequest(filters);

      expect(result).toEqual({
        tipoinmueble: ['Todos'],
        areamin: 0,
        areamax: 0,
        antiguedadmin: 0,
        max_age: expect.any(Number), // Current year
        estratomin: 0,
        estratomax: 0,
        polygon: undefined,
        address: undefined,
        chip: undefined,
        matricula: undefined,
        copropiedad: undefined
      });
    });
  });

  describe('searchProperties', () => {
    it('returns simulated data in development mode', async () => {
      const searchRequest = {
        tipoinmueble: ['Todos'],
        areamin: 0,
        areamax: 0,
        antiguedadmin: 0,
        max_age: 2025,
        estratomin: 0,
        estratomax: 0
      };

      const result = await searchProperties(searchRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.message).toContain('simulated');
    });

    it('handles API errors in production mode', async () => {
      // Mock production environment
      Object.defineProperty(window, 'ENV', {
        value: { NODE_ENV: 'production' },
        writable: true
      });

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const searchRequest = {
        tipoinmueble: ['Todos'],
        areamin: 0,
        areamax: 0,
        antiguedadmin: 0,
        max_age: 2025,
        estratomin: 0,
        estratomax: 0
      };

      const result = await searchProperties(searchRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('handles successful API response in production mode', async () => {
      // Mock production environment
      Object.defineProperty(window, 'ENV', {
        value: { NODE_ENV: 'production' },
        writable: true
      });

      const mockResponse = {
        success: true,
        message: 'Found 5 properties',
        data: [
          {
            id: 1,
            barmanpre: '123456789',
            preaconst: 100,
            preaterre: 200,
            prevetustzmin: 2000,
            prevetustzmax: 2000,
            estrato: 4,
            predios: 1,
            connpisos: 2,
            connsotano: 0,
            contsemis: 0,
            conelevaci: 2,
            formato_direccion: 'Test Address',
            nombre_conjunto: 'Test Building',
            prenbarrio: 'Test Neighborhood',
            precbarrio: '123',
            locnombre: 'Test Location',
            preusoph: 'S',
            manzcodigo: '123456',
            esquinero: 0,
            viaprincipal: 0,
            lista_precuso: '001',
            lista_precdestin: '01',
            wkt: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))'
          }
        ],
        total: 5
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const searchRequest = {
        tipoinmueble: ['Todos'],
        areamin: 0,
        areamax: 0,
        antiguedadmin: 0,
        max_age: 2025,
        estratomin: 0,
        estratomax: 0
      };

      const result = await searchProperties(searchRequest);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe(1);
    });
  });
});
