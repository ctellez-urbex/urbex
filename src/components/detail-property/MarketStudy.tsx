/**
 * MarketStudy Component
 * Displays market analysis and statistics for the property and surrounding area
 * Following modular architecture like Overview component
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketFilters, MarketMetrics, MarketCharts, MarketMap, MarketFiltersData } from './market-study-sections';
import { getMarketStudy, MarketStudyResponse } from '@/config/api-detail-property';

interface MarketStudyProps {
  data: Partial<MarketStudyResponse>;
  propertyData?: {
    id: string;
    latitud?: number;
    longitud?: number;
    polygon?: string;
  };
}

export default function MarketStudy({ data, propertyData }: MarketStudyProps) {
  const [marketData, setMarketData] = useState<Partial<MarketStudyResponse>>(data);
  const [filters, setFilters] = useState<MarketFiltersData>({
    metros: 500,
    tipoInmueble: [],
    tipoUso: [],
    areaMin: 0,
    areaMax: 0,
    estratoMin: 0,
    estratoMax: 0,
    desdeAntiguedad: 0,
    hastaAntiguedad: new Date().getFullYear(),
    precuso: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Check if we have initial data
  useEffect(() => {
    const hasInitialData = data?.data_polygon_radio || data?.data_transacciones || data?.data_prediales || data?.data_market;
    setHasData(!!hasInitialData);
  }, [data]);

  const handleFiltersChange = async (newFilters: MarketFiltersData) => {
    setFilters(newFilters);
    
    if (!propertyData?.id) {
      console.warn('⚠️ No property ID available for market study');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare API request parameters
      const requestParams = {
        barmanpre: propertyData.id,
        metros: newFilters.metros,
        areamin: newFilters.areaMin,
        areamax: newFilters.areaMax,
        estratomin: newFilters.estratoMin,
        estratomax: newFilters.estratoMax,
        desde_antiguedad: newFilters.desdeAntiguedad,
        hasta_antiguedad: newFilters.hastaAntiguedad,
        precuso: newFilters.precuso,
        latitud: propertyData.latitud,
        longitud: propertyData.longitud,
        polygon: propertyData.polygon,
        segmentacion: propertyData.polygon ? 'poligono' : 'radio',
        spatialRelation: 'intersects',
        tabla: 'bogota_data_lotes_fastsearch',
        get_tabla: false
      };

      console.log('🔍 Fetching market study with params:', requestParams);
      const marketStudyData = await getMarketStudy(propertyData.id);
      setMarketData(marketStudyData);
      setHasData(true);
    } catch (error) {
      console.error('❌ Error fetching market study:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    console.log('📄 PDF generation not yet implemented');
  };

  const viewNewProjects = () => {
    if (!propertyData?.latitud || !propertyData?.longitud) {
      console.warn('⚠️ No coordinates available for new projects');
      return;
    }

    const params = {
      type: 'proyectos_nuevos',
      inputvar: {
        latitud: propertyData.latitud,
        longitud: propertyData.longitud,
        metros: 500,
        areamin: 0,
        areamax: 0,
        pisosmin: 0,
        pisosmax: 0,
        estratomin: 0,
        estratomax: 0,
        desde_antiguedad: 0,
        hasta_antiguedad: 0,
        precuso: []
      },
      token: ''
    };
    
    const encodedParams = btoa(JSON.stringify(params));
    const url = `http://www.urbex.com.co/Reporte?token=${encodedParams}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Estudio de Mercado</h1>
        </div>
        <p className="text-green-100 text-lg mb-4">
          Análisis del mercado inmobiliario y transacciones de la zona
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Generar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={viewNewProjects}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Proyectos Nuevos
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MarketFilters 
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            Analizando mercado...
          </div>
        </div>
      )}

      {/* Content */}
      {hasData && !isLoading && (
        <div className="space-y-6">
          {/* Map */}
          <MarketMap 
            data={{
              ...marketData,
              latitud: propertyData?.latitud,
              longitud: propertyData?.longitud,
              polygon: propertyData?.polygon
            }}
          />

          {/* Metrics */}
          <MarketMetrics data={marketData} />

          {/* Charts */}
          <MarketCharts data={marketData} />
        </div>
      )}

      {/* No Data State */}
      {!hasData && !isLoading && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay datos de mercado disponibles
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Ajusta los filtros y haz clic en "Filtrar" para obtener el análisis de mercado
          </p>
        </div>
      )}
    </div>
  );
}

