/**
 * MarketMap Component
 * Displays interactive map with property data and market analysis
 */

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Building2 } from 'lucide-react';

interface MarketMapProps {
  data: {
    data_polygon_radio?: any;
    data_transacciones?: any;
    latitud?: number;
    longitud?: number;
    polygon?: string;
  };
}

// Helper to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
};

export default function MarketMap({ data }: MarketMapProps) {
  const mapInitialized = useRef(false);
  const mapRef = useRef<any>(null);

  const data_polygon_radio = data?.data_polygon_radio || {};
  const data_transacciones = data?.data_transacciones || {};
  const latitud = data?.latitud;
  const longitud = data?.longitud;
  const polygon = data?.polygon;

  useEffect(() => {
    if (mapInitialized.current || typeof window === 'undefined') return;
    
    const initMap = () => {
      if (!(window as any).L) {
        console.warn('⏳ Leaflet not loaded yet for MarketMap, retrying...');
        setTimeout(initMap, 500);
        return;
      }

      try {
        const L = (window as any).L;
        console.log('🗺️ Initializing MarketMap...');

        // Check if we have valid coordinates
        if (!latitud || !longitud) {
          console.warn('⚠️ No valid coordinates for MarketMap');
          return;
        }

        // Initialize map
        const mapElement = document.getElementById('leaflet-map-market');
        if (!mapElement) {
          console.error('❌ MarketMap container not found');
          return;
        }

        // Clear existing map
        if (mapRef.current) {
          mapRef.current.remove();
        }

        mapRef.current = L.map('leaflet-map-market').setView([latitud, longitud], 16);

        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapRef.current);

        // Add polygon if available
        if (polygon) {
          try {
            // Parse WKT polygon (simplified - in real implementation you'd use a proper WKT parser)
            const polygonLayer = L.polygon([], {
              color: '#0095ff',
              weight: 2,
              fillOpacity: 0.1
            }).addTo(mapRef.current);
            
            // Add polygon bounds to map view
            if (polygonLayer.getBounds().isValid()) {
              mapRef.current.fitBounds(polygonLayer.getBounds());
            }
          } catch (error) {
            console.warn('⚠️ Could not parse polygon:', error);
          }
        }

        // Add property data if available
        const lotesData = getNestedValue(data_polygon_radio, 'data', []);
        if (Array.isArray(lotesData) && lotesData.length > 0) {
          console.log(`🗺️ Adding ${lotesData.length} properties to map`);
          
          lotesData.forEach((lote: any, index: number) => {
            if (lote.latitud && lote.longitud) {
              const hasTransactions = lote.transacciones > 0;
              const color = hasTransactions ? '#B20256' : '#5A189A';
              
              const marker = L.circleMarker([lote.latitud, lote.longitud], {
                radius: 8,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }).addTo(mapRef.current);

              // Create popup content
              let popupContent = '<div style="font-size: 12px; max-width: 200px;">';
              
              if (lote.formato_direccion) {
                popupContent += `<b>Dirección:</b> ${lote.formato_direccion}<br>`;
              }
              if (lote.nombre_conjunto) {
                popupContent += `<b>Edificio:</b> ${lote.nombre_conjunto}<br>`;
              }
              if (lote.prenbarrio) {
                popupContent += `<b>Barrio:</b> ${lote.prenbarrio}<br>`;
              }
              if (lote.estrato && lote.estrato > 0) {
                popupContent += `<b>Estrato:</b> ${lote.estrato}<br>`;
              }
              if (lote.preaconst) {
                popupContent += `<b>Área construida:</b> ${lote.preaconst.toFixed(2)} m²<br>`;
              }
              if (lote.preaterre) {
                popupContent += `<b>Área terreno:</b> ${lote.preaterre.toFixed(2)} m²<br>`;
              }
              if (lote.prevetustzmin) {
                popupContent += `<b>Antigüedad:</b> ${lote.prevetustzmin} años<br>`;
              }
              if (lote.connpisos) {
                popupContent += `<b>Pisos:</b> ${lote.connpisos}<br>`;
              }
              if (lote.transacciones) {
                popupContent += `<b>Transacciones:</b> ${lote.transacciones}<br>`;
              }
              if (lote.cuantiamt2) {
                popupContent += `<b>Valor mt²:</b> $${lote.cuantiamt2.toLocaleString('es-CO')}<br>`;
              }
              
              popupContent += '</div>';

              marker.bindPopup(popupContent);
            }
          });
        }

        mapInitialized.current = true;
        console.log('✅ MarketMap initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing MarketMap:', error);
      }
    };

    // Try to initialize after a delay
    const timer = setTimeout(initMap, 1000);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitud, longitud, polygon, data_polygon_radio]);

  // Load Leaflet CSS and JS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const hasValidLocation = latitud && longitud;

  if (!hasValidLocation) {
    return (
      <Card className="shadow-md">
        <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Mapa de Análisis de Mercado
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron coordenadas válidas para mostrar el mapa
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Mapa de Análisis de Mercado
            </h3>
          </div>
          {/* Legend */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <span className="text-gray-600 dark:text-gray-400">Sin transacciones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-gray-600 dark:text-gray-400">Con transacciones</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="w-full h-[500px] rounded-lg overflow-hidden">
          <div id="leaflet-map-market" className="w-full h-full"></div>
        </div>
      </div>
    </Card>
  );
}
