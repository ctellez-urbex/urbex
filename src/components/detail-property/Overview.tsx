/**
 * Overview Component
 * Displays comprehensive property information including location, characteristics,
 * transactions, market data, and regulatory information (POT, DANE)
 * 
 * @component
 * @architecture Clean Architecture - Presentation Layer
 * @principles SOLID - Single Responsibility, Open/Closed
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, MapPin, Layers, Calendar, DollarSign, Building2, 
  Ruler, Users, FileText, TrendingUp, Map, BarChart3,
  ExternalLink, Search, ChevronDown, ChevronUp, MapIcon 
} from 'lucide-react';
import {
  TipologiaTable,
  PrediosTable,
  TransaccionesTable,
  CTLTable,
  ListingsGrid,
  EstadisticasCharts,
} from './overview-sections';

interface OverviewProps {
  data: {
    data_caracteristicas?: any;
    data_lote_polygon?: any;
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
  };
  propertyData?: {
    id: string;
    barmanpre?: string;
  };
  onNavigateToUnit?: (chip: string) => void;
}

// Helper function to format currency
const formatCurrency = (value: any): string => {
  if (value == null || isNaN(Number(value))) return 'Sin información';
  return `$${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

// Helper function to format number
const formatNumber = (value: any, decimals: number = 2): string => {
  if (value == null || isNaN(Number(value))) return 'Sin información';
  return Number(value).toLocaleString('es-CO', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

// Helper to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
};

// MapCard Component for displaying maps
interface MapCardProps {
  title: string;
  icon?: React.ReactNode;
  mapId: string;
}

const MapCard: React.FC<MapCardProps> = ({ title, icon, mapId }) => {
  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center gap-2">
          {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
      </div>
      <div className="p-0">
        <div 
          id={mapId} 
          className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-b-lg flex items-center justify-center"
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Cargando mapa...</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// InfoCard Component for displaying key-value pairs
interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  items: Array<{
    label: string;
    value: string | number | null;
    isSubheader?: boolean;
    isButton?: boolean;
    url?: string;
  }>;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, items }) => {
  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-2">
          {icon && <span className="text-purple-600 dark:text-purple-400">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {items.map((item, index) => {
            if (item.isSubheader) {
              return (
                <div key={index} className="pt-3 pb-1">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {item.label}
                  </h4>
                </div>
              );
            }
            
            if (item.isButton && item.url) {
              return (
                <div key={index} className="pt-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-100 rounded-md transition-colors duration-150 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {item.label}
                  </a>
                </div>
              );
            }
            
            // Mostrar el campo con valor o con "Sin información"
            // Nota: 0 es un valor válido (ej: estrato 0, 0 pisos)
            const displayValue = (item.value === null || item.value === '' || item.value === undefined) 
              ? 'Sin información' 
              : item.value;
            
            return (
              <div key={index} className="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
                <span className={`text-sm font-medium text-right flex-1 ${
                  displayValue === 'Sin información' 
                    ? 'text-gray-400 dark:text-gray-500 italic' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default function Overview({ data, propertyData, onNavigateToUnit }: OverviewProps) {
  const caracteristicas = data?.data_caracteristicas || {};
  const lotePolygon = data?.data_lote_polygon || {};
  const prediales = data?.data_prediales_actuales || {};
  const transacciones = data?.data_transacciones || {};
  const propietarios = data?.data_propietarios || {};
  const pot = data?.data_pot || {};
  const dane = data?.data_dane || {};
  const ctl = data?.data_ctl || {};
  const licencias = data?.data_licencias || {};
  const market = data?.data_market || {};
  const marketBarrio = data?.data_market_barrio || {};
  const reportingBarrio = data?.data_reporting_barrio || {};

  // Refs for map initialization
  const mapsInitialized = useRef(false);

  // Get location data
  const latitud = getNestedValue(lotePolygon, 'location.latitud', null);
  const longitud = getNestedValue(lotePolygon, 'location.longitud', null);
  const hasValidLocation = latitud != null && longitud != null && 
                          typeof latitud === 'number' && typeof longitud === 'number';

  // Initialize maps when location data is available
  useEffect(() => {
    if (!hasValidLocation || mapsInitialized.current) return;

    // Check if Google Maps API is loaded
    const initializeGoogleMaps = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          // Initialize Street View
          // const latLong = new google.maps.LatLng(latitud, longitud);
          const streetViewElement = document.getElementById('mapstreetview');
          if (streetViewElement) {
            const panorama = new (window as any).google.maps.StreetViewPanorama(
              streetViewElement,
              {
                position: { lat: latitud, lng: longitud },
                pov: { heading: 0, pitch: 0 },
                zoom: 1
              }
            );
          }

          // Initialize Satellite Map
          const satelitalElement = document.getElementById('mapsatelital');
          if (satelitalElement) {
            const map = new (window as any).google.maps.Map(satelitalElement, {
              center: { lat: latitud, lng: longitud },
              zoom: 19,
              mapTypeId: 'satellite'
            });

            // Add polygon if available
            const polygonCoords = getNestedValue(lotePolygon, 'geometry.googleCoords', null);
            if (polygonCoords && Array.isArray(polygonCoords)) {
              const polygon = new (window as any).google.maps.Polygon({
                paths: polygonCoords,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#808080',
                fillOpacity: 0.35
              });
              polygon.setMap(map);
            }
          }

          console.log('✅ Google Maps initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing Google Maps:', error);
        }
      }
    };

    // Check if Mapbox API is loaded
    const initializeMapbox = () => {
      if (typeof window !== 'undefined' && (window as any).mapboxgl) {
        try {
          const mapboxElement = document.getElementById('3dmapbox');
          const mapboxToken = (window as any).ENV?.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          
          if (mapboxElement) {
            // Clear any existing content
            mapboxElement.innerHTML = '';
            
            if (mapboxToken) {
              (window as any).mapboxgl.accessToken = mapboxToken;
              
              const map = new (window as any).mapboxgl.Map({
                container: '3dmapbox',
                style: 'mapbox://styles/mapbox/light-v11',
                center: [longitud, latitud],
                zoom: 18,
                pitch: 45,
                bearing: -17.6,
                antialias: true
              });

              map.on('load', () => {
                // Add 3D buildings layer
                const buildings = getNestedValue(lotePolygon, 'constructions', []);
                if (Array.isArray(buildings) && buildings.length > 0) {
                  buildings.forEach((building: any, index: number) => {
                    if (building.geometry && building.connpisos) {
                      const buildingId = `edificio-${index}`;
                      map.addSource(buildingId, {
                        type: 'geojson',
                        data: building.geometry
                      });

                      const floors = parseInt(building.connpisos) || 1;
                      const floorHeight = 3;
                      const color = building.color || '#A16CFF';

                      for (let i = 0; i < floors; i++) {
                        map.addLayer({
                          id: `${buildingId}-piso-${i}`,
                          type: 'fill-extrusion',
                          source: buildingId,
                          paint: {
                            'fill-extrusion-color': color,
                            'fill-extrusion-height': (i + 1) * floorHeight,
                            'fill-extrusion-base': i * floorHeight,
                            'fill-extrusion-opacity': 0.5
                          }
                        });
                      }
                    }
                  });
                }

                // Add default 3D buildings
                map.addLayer({
                  'id': '3d-buildings',
                  'source': 'composite',
                  'source-layer': 'building',
                  'filter': ['==', 'extrude', 'true'],
                  'type': 'fill-extrusion',
                  'minzoom': 15,
                  'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15, 0,
                      15.05, ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15, 0,
                      15.05, ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                  }
                });
              });

              console.log('✅ Mapbox 3D initialized successfully');
            } else {
              console.warn('⚠️ Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local');
              // Show message in the map container
              mapboxElement.innerHTML = `
                <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div class="text-center">
                    <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-sm">Mapbox token no configurado</p>
                    <p class="text-xs mt-1">Agrega NEXT_PUBLIC_MAPBOX_TOKEN en .env.local</p>
                  </div>
                </div>
              `;
            }
          }
        } catch (error) {
          console.error('❌ Error initializing Mapbox:', error);
        }
      }
    };

    // Try to initialize maps
    const timer = setTimeout(() => {
      initializeGoogleMaps();
      initializeMapbox();
      mapsInitialized.current = true;
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasValidLocation, latitud, longitud, lotePolygon]);

  // Calculate number of owners
  const propietarios1 = getNestedValue(propietarios, 'owners.count', 0);
  const propietarios2 = getNestedValue(prediales, 'propietarios', 0);
  const numPropietarios = Math.max(
    typeof propietarios1 === 'number' ? propietarios1 : 0,
    typeof propietarios2 === 'number' ? propietarios2 : 0
  );

  // Get barrio catastral
  const barrioCatastral = caracteristicas?.prenbarrio || '';
  
  // Process reporting data
  const reporting = getNestedValue(reportingBarrio, 'reporting.0.variacionesBarrio90d.0', {});
  const valorMedianoMt2Barrio = reporting?.valor_mediano_mt2_barrio_90d 
    ? formatCurrency(reporting.valor_mediano_mt2_barrio_90d)
    : 'Sin información';
  const numeroTransaccionesBarrio = reporting?.numero_transacciones_barrio_90d
    ? formatNumber(reporting.numero_transacciones_barrio_90d, 0)
    : 'Sin información';
  const valorizacionBarrio = reporting?.variacion_precio_mediano_trimestral_pct != null
    ? `${formatNumber(reporting.variacion_precio_mediano_trimestral_pct, 2)}%`
    : 'Sin información';

  // Prepare info sections
  const ubicacionItems = [
    { label: 'Dirección:', value: caracteristicas?.formato_direccion || '' },
    { label: 'Localidad:', value: caracteristicas?.locnombre || '' },
    { label: 'UPL:', value: getNestedValue(pot, 'principalData.upl.nombre_upl', 'Sin información') },
    { label: 'Código UPL:', value: getNestedValue(pot, 'principalData.upl.codigo_upl', 'Sin información') },
    { label: 'Barrio catastral:', value: caracteristicas?.prenbarrio || '' },
    { label: 'Estrato:', value: caracteristicas?.estrato ? String(Math.floor(caracteristicas.estrato)) : 0 },
    { label: 'Edificio:', value: caracteristicas?.nombre_conjunto || '' },
  ];

  const terrenoItems = [
    { 
      label: 'Área del terreno:', 
      value: caracteristicas?.preaterre ? `${formatNumber(caracteristicas.preaterre)} m²` : '0 m²' 
    },
    { label: 'Esquinero:', value: caracteristicas?.esquinero || 'No' },
    { label: 'Vía principal:', value: caracteristicas?.viaprincipal || 'No' },
    { label: 'Frente x Fondo:', value: lotePolygon?.frente_fondo || 'Sin información' },
    { 
      label: 'Área del polígono:', 
      value: getNestedValue(lotePolygon, 'plot.areaPolygon') 
        ? `${formatNumber(lotePolygon.plot.areaPolygon)} m²` 
        : 'Sin información' 
    },
  ];

  const caracteristicasItems = [
    { 
      label: 'Predios [matrículas independientes]:', 
      value: caracteristicas?.predios ? String(Math.floor(caracteristicas.predios)) : 0 
    },
    { label: 'Pisos:', value: caracteristicas?.connpisos ? String(Math.floor(caracteristicas.connpisos)) : 0 },
    { label: 'Sótanos:', value: caracteristicas?.connsotano ? String(Math.floor(caracteristicas.connsotano)) : 0 },
    { 
      label: 'Área total construida:', 
      value: caracteristicas?.preaconst ? `${formatNumber(caracteristicas.preaconst)} m²` : '0 m²' 
    },
    { 
      label: 'Antigüedad:', 
      value: caracteristicas?.prevetustzmax ? `${Math.floor(caracteristicas.prevetustzmax)}` : '0' 
    },
    { label: 'PH:', value: caracteristicas?.preusoph || 'Sin información' },
  ];

  const predialItems = [
    {
      label: 'Avalúo catastral por m²:',
      value: getNestedValue(prediales, 'avaluoCatastral.valorMt2') 
        ? formatCurrency(prediales.avaluoCatastral.valorMt2)
        : 'Sin información'
    },
    {
      label: 'Predial por m²:',
      value: getNestedValue(prediales, 'impuestoPredial.valorMt2')
        ? formatCurrency(prediales.impuestoPredial.valorMt2)
        : 'Sin información'
    },
    {
      label: 'Propietarios:',
      value: numPropietarios > 0 ? String(numPropietarios) : 'Sin información'
    },
    {
      label: 'Avalúo catastral total:',
      value: getNestedValue(prediales, 'avaluoCatastral.totalAvaluo')
        ? formatCurrency(prediales.avaluoCatastral.totalAvaluo)
        : 'Sin información'
    },
    {
      label: 'Impuesto predial total:',
      value: getNestedValue(prediales, 'impuestoPredial.totalImpuesto')
        ? formatCurrency(prediales.impuestoPredial.totalImpuesto)
        : 'Sin información'
    },
    {
      label: 'Avalúo catastral del suelo por m²:',
      value: getNestedValue(prediales, 'suelo.valorAvaluoSueloMt2')
        ? formatCurrency(prediales.suelo.valorAvaluoSueloMt2)
        : 'Sin información'
    },
    {
      label: 'Predial del suelo por m²:',
      value: getNestedValue(prediales, 'suelo.valorPredialSueloMt2')
        ? formatCurrency(prediales.suelo.valorPredialSueloMt2)
        : 'Sin información'
    },
  ];

  const transaccionesItems = [
    { label: 'Último año', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(transacciones, 'summary.ultimoAno.valor_promedio_mt2')
        ? formatCurrency(transacciones.summary.ultimoAno.valor_promedio_mt2)
        : 'Sin información'
    },
    {
      label: 'Total compraventas y/o leasing:',
      value: getNestedValue(transacciones, 'summary.ultimoAno.total_compraventas')
        ? String(Math.floor(transacciones.summary.ultimoAno.total_compraventas))
        : 'Sin información'
    },
    { label: 'Desde el 2019 a la fecha', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(transacciones, 'summary.historico.valor_promedio_mt2')
        ? formatCurrency(transacciones.summary.historico.valor_promedio_mt2)
        : 'Sin información'
    },
    {
      label: 'Total compraventas y/o leasing:',
      value: getNestedValue(transacciones, 'summary.historico.total_compraventas')
        ? String(Math.floor(transacciones.summary.historico.total_compraventas))
        : 'Sin información'
    },
  ];

  const ventaItems = [
    { label: 'Listings Activos', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(market, 'indicadoresMercado.venta.valorMedianoPorM2') &&
             getNestedValue(market, 'indicadoresMercado.venta.propiedadesActivas', 0) > 0
        ? formatCurrency(market.indicadoresMercado.venta.valorMedianoPorM2)
        : 'Sin información'
    },
    {
      label: '# de listings:',
      value: getNestedValue(market, 'indicadoresMercado.venta.propiedadesActivas')
        ? String(Math.floor(market.indicadoresMercado.venta.propiedadesActivas))
        : 'Sin información'
    },
    { label: 'Listings No Activos', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(market, 'indicadoresMercado.venta.valorMedianoPorM2') &&
             getNestedValue(market, 'indicadoresMercado.venta.propiedadesHistoricas', 0) > 0
        ? formatCurrency(market.indicadoresMercado.venta.valorMedianoPorM2)
        : 'Sin información'
    },
    {
      label: '# de listings:',
      value: getNestedValue(market, 'indicadoresMercado.venta.propiedadesHistoricas')
        ? String(Math.floor(market.indicadoresMercado.venta.propiedadesHistoricas))
        : 'Sin información'
    },
  ];

  const arriendoItems = [
    { label: 'Listings Activos', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(market, 'indicadoresMercado.arriendo.valorMedianoPorM2') &&
             getNestedValue(market, 'indicadoresMercado.arriendo.propiedadesActivas', 0) > 0
        ? formatCurrency(market.indicadoresMercado.arriendo.valorMedianoPorM2)
        : 'Sin información'
    },
    {
      label: '# de listings:',
      value: getNestedValue(market, 'indicadoresMercado.arriendo.propiedadesActivas')
        ? String(Math.floor(market.indicadoresMercado.arriendo.propiedadesActivas))
        : 'Sin información'
    },
    { label: 'Listings No Activos', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(market, 'indicadoresMercado.arriendo.valorMedianoPorM2') &&
             getNestedValue(market, 'indicadoresMercado.arriendo.propiedadesHistoricas', 0) > 0
        ? formatCurrency(market.indicadoresMercado.arriendo.valorMedianoPorM2)
        : 'Sin información'
    },
    {
      label: '# de listings:',
      value: getNestedValue(market, 'indicadoresMercado.arriendo.propiedadesHistoricas')
        ? String(Math.floor(market.indicadoresMercado.arriendo.propiedadesHistoricas))
        : 'Sin información'
    },
  ];

  const barrioTransaccionesItems = [
    { label: 'Precios de cierre promedio m²:', value: valorMedianoMt2Barrio },
    { label: 'Número de transacciones:', value: numeroTransaccionesBarrio },
    { label: 'Valorización:', value: valorizacionBarrio },
    {
      label: 'Ver reporte inmobiliario del barrio',
      value: '',
      isButton: true,
      url: getNestedValue(reportingBarrio, 'reporting.0.url', null)
    },
  ];

  const barrioOfertaItems = [
    { label: 'Venta', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(marketBarrio, 'venta.precio')
        ? formatCurrency(marketBarrio.venta.precio)
        : 'Sin información'
    },
    {
      label: 'Valorización:',
      value: getNestedValue(marketBarrio, 'venta.valorizacion') != null
        ? `${marketBarrio.venta.valorizacion}%`
        : 'Sin información'
    },
    { label: 'Arriendo', value: '', isSubheader: true },
    {
      label: 'Valor promedio m²:',
      value: getNestedValue(marketBarrio, 'arriendo.precio')
        ? formatCurrency(marketBarrio.arriendo.precio)
        : 'Sin información'
    },
    {
      label: 'Valorización:',
      value: getNestedValue(marketBarrio, 'arriendo.valorizacion') != null
        ? `${marketBarrio.arriendo.valorizacion}%`
        : 'Sin información'
    },
  ];

  const potItems = [
    { label: 'Tratamiento Urbanístico', value: '', isSubheader: true },
    {
      label: 'Tipo de tratamiento:',
      value: getNestedValue(pot, 'principalData.tratamiento_urbanistico.tipo_tratamiento') || 'Sin información'
    },
    {
      label: 'Tipología:',
      value: getNestedValue(pot, 'principalData.tratamiento_urbanistico.tipologia') || 'Sin información'
    },
    {
      label: 'Altura máx:',
      value: getNestedValue(pot, 'principalData.tratamiento_urbanistico.altura_max') || 'Sin información'
    },
    {
      label: 'Acto admin:',
      value: getNestedValue(pot, 'principalData.tratamiento_urbanistico.acto_admin') || 'Sin información'
    },
    { label: 'Área de actividad', value: '', isSubheader: true },
    {
      label: 'Nombre:',
      value: getNestedValue(pot, 'principalData.area_actividad.nombre') || 'Sin información'
    },
    { label: 'Actuación Estratégica', value: '', isSubheader: true },
    {
      label: 'Nombre:',
      value: getNestedValue(pot, 'principalData.actuacion_estrategica.nombre') || 'No aplica'
    },
    {
      label: 'Priorización:',
      value: getNestedValue(pot, 'principalData.actuacion_estrategica.priorizacion') || 'No aplica'
    },
    { label: 'Antejardín', value: '', isSubheader: true },
    {
      label: 'Dimensión:',
      value: getNestedValue(pot, 'principalData.antejardin.dimension') || 'Sin información'
    },
    {
      label: 'Observación:',
      value: getNestedValue(pot, 'principalData.antejardin.descripcion') || 'Sin información'
    },
    { label: 'Aeronáutica', value: '', isSubheader: true },
    {
      label: 'Elevación:',
      value: getNestedValue(pot, 'principalData.aeronautica.elevacion') != null
        ? formatNumber(pot.principalData.aeronautica.elevacion)
        : 'Sin información'
    },
    {
      label: 'Altura:',
      value: getNestedValue(pot, 'principalData.aeronautica.altura') != null
        ? formatNumber(pot.principalData.aeronautica.altura)
        : 'Sin información'
    },
  ];

  const demografiaItems = [
    {
      label: 'Total personas:',
      value: getNestedValue(dane, 'poblacion.total')
        ? formatNumber(dane.poblacion.total, 0)
        : 'Sin información'
    },
    {
      label: 'Total viviendas:',
      value: getNestedValue(dane, 'viviendas.total')
        ? formatNumber(dane.viviendas.total, 0)
        : 'Sin información'
    },
    {
      label: 'Total hogares:',
      value: getNestedValue(dane, 'hogares.total')
        ? formatNumber(dane.hogares.total, 0)
        : 'Sin información'
    },
    {
      label: 'Hombres:',
      value: getNestedValue(dane, 'poblacion.hombres')
        ? formatNumber(dane.poblacion.hombres, 0)
        : 'Sin información'
    },
    {
      label: 'Mujeres:',
      value: getNestedValue(dane, 'poblacion.mujeres')
        ? formatNumber(dane.poblacion.mujeres, 0)
        : 'Sin información'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Descripción General</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Vista completa de la propiedad con datos catastrales, transaccionales, de mercado y normativos
        </p>
      </div>

      {/* Maps Section */}
      {hasValidLocation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MapCard
            title="Street View"
            icon={<MapPin className="w-5 h-5" />}
            mapId="mapstreetview"
          />
          <MapCard
            title="Vista Satelital"
            icon={<Map className="w-5 h-5" />}
            mapId="mapsatelital"
          />
          <MapCard
            title="Mapa 3D"
            icon={<Layers className="w-5 h-5" />}
            mapId="3dmapbox"
          />
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard 
          title="Ubicación" 
          icon={<MapPin className="w-5 h-5" />}
          items={ubicacionItems} 
        />
        <InfoCard 
          title="Terreno" 
          icon={<Ruler className="w-5 h-5" />}
          items={terrenoItems} 
        />
        <InfoCard 
          title="Características" 
          icon={<Home className="w-5 h-5" />}
          items={caracteristicasItems} 
        />
        <InfoCard 
          title="Información Predial" 
          icon={<FileText className="w-5 h-5" />}
          items={predialItems} 
        />
        <InfoCard 
          title="Transacciones" 
          icon={<TrendingUp className="w-5 h-5" />}
          items={transaccionesItems} 
        />
        <InfoCard 
          title="Precios de Referencia en Venta" 
          icon={<DollarSign className="w-5 h-5" />}
          items={ventaItems} 
        />
        <InfoCard 
          title="Precios de Referencia en Arriendo" 
          icon={<DollarSign className="w-5 h-5" />}
          items={arriendoItems} 
        />
        <InfoCard 
          title={`Transacciones reales en ${barrioCatastral || 'el barrio'} (último trimestre)`}
          icon={<BarChart3 className="w-5 h-5" />}
          items={barrioTransaccionesItems} 
        />
        <InfoCard 
          title={`Valores de referencia de la oferta en ${barrioCatastral || 'el barrio'}`}
          icon={<TrendingUp className="w-5 h-5" />}
          items={barrioOfertaItems} 
        />
        <InfoCard 
          title="P.O.T" 
          icon={<Map className="w-5 h-5" />}
          items={potItems} 
        />
        <InfoCard 
          title={`Información Demográfica ${barrioCatastral || ''}`}
          icon={<Users className="w-5 h-5" />}
          items={demografiaItems} 
        />
      </div>

      {/* Tipología Table */}
      {caracteristicas?.tipologia && Array.isArray(caracteristicas.tipologia) && (
        <TipologiaTable data={caracteristicas.tipologia} />
      )}

      {/* Estadísticas Charts */}
      <EstadisticasCharts
        transaccionesData={
          transacciones?.annualData?.priceByYear
            ?.sort((a: any, b: any) => b.year - a.year)
            ?.slice(0, 5)
            ?.sort((a: any, b: any) => a.year - b.year)
            ?.map((item: any) => ({
              year: item.year,
              label: 'Transacciones mt2',
              valor: item.valor_mt2
            }))
        }
        avaluoData={
          prediales?.avaluoMt2Historico
            ?.sort((a: any, b: any) => b.year - a.year)
            ?.slice(0, 5)
            ?.sort((a: any, b: any) => a.year - b.year)
            ?.map((item: any) => ({
              year: item.year,
              label: 'Avalúo mt2',
              valor: item.valorMt2
            }))
        }
        predialData={
          prediales?.predialMt2Historico
            ?.sort((a: any, b: any) => b.year - a.year)
            ?.slice(0, 5)
            ?.sort((a: any, b: any) => a.year - b.year)
            ?.map((item: any) => ({
              year: item.year,
              label: 'Predial mt2',
              valor: item.valorMt2
            }))
        }
        listingsData={[
          ...(market?.tendenciasTemporal?.venta?.datosPorAno
            ?.sort((a: any, b: any) => b.year - a.year)
            ?.slice(0, 5)
            ?.sort((a: any, b: any) => a.year - b.year)
            ?.map((item: any) => ({
              year: item.year,
              label: 'Listings venta mt2',
              valor: item.valormt2
            })) || []),
          ...(market?.tendenciasTemporal?.arriendo?.datosPorAno
            ?.sort((a: any, b: any) => b.year - a.year)
            ?.slice(0, 5)
            ?.sort((a: any, b: any) => a.year - b.year)
            ?.map((item: any) => ({
              year: item.year,
              label: 'Listings arriendo mt2',
              valor: item.valormt2
            })) || [])
        ]}
        tipologiaData={caracteristicas?.tipologia}
        transaccionesStats={transacciones?.statistics}
        areaStats={prediales?.estadisticasArea}
      />

      {/* Predios Table */}
      {(caracteristicas?.lista_predios || prediales?.predios) && (
        <PrediosTable 
          data={caracteristicas?.lista_predios || prediales?.predios || []}
          onPredioClick={onNavigateToUnit}
        />
      )}

      {/* Transacciones Table */}
      {transacciones?.transactions && (
        <TransaccionesTable data={transacciones.transactions} />
      )}

      {/* CTL Table */}
      {ctl?.certificados && (
        <CTLTable data={ctl.certificados} />
      )}

      {/* Listings Grid */}
      {market?.listadoPropiedades && Array.isArray(market.listadoPropiedades) && (
        <ListingsGrid 
          data={market.listadoPropiedades}
          title="Propiedades en el Mercado"
        />
      )}
    </div>
  );
}

