/**
 * Clean Map Search Component
 * 
 * Simple, focused map for polygon drawing and property search
 * - Bogotá map with good resolution
 * - Intuitive polygon drawing
 * - Clean visual feedback
 * - No info bubbles
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Trash2, Search } from 'lucide-react';
import { PropertyData } from '@/config/api-properties';

interface CleanMapSearchProps {
  properties: PropertyData[];
  onPolygonSearch: (polygon: string, filters?: any) => void;
  onPropertySelect?: (property: PropertyData | null) => void;
  selectedProperty?: PropertyData | null;
  currentFilters?: any;
  loading?: boolean;
}

// Bogotá center coordinates
const BOGOTA_CENTER = [4.6097, -74.0817];
const BOGOTA_ZOOM = 11;

export function CleanMapSearch({ 
  properties, 
  onPolygonSearch, 
  onPropertySelect, 
  selectedProperty, 
  currentFilters, 
  loading = false 
}: CleanMapSearchProps) {
  console.log('🗺️ CleanMapSearch component initialized');
  
  const [isClient, setIsClient] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [isSearchCompleted, setIsSearchCompleted] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentPolygonRef = useRef<any>(null);
  const currentLineRef = useRef<any>(null);
  const propertiesLayerRef = useRef<any>(null);
  const handleMapClickRef = useRef<(latlng: any) => void>();
  const polygonPointsRef = useRef<[number, number][]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map with good resolution
        const map = L.map(mapRef.current!, {
          center: BOGOTA_CENTER as [number, number],
          zoom: BOGOTA_ZOOM,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: false, // Disable to use for polygon finishing
        });

        // Add high-quality tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }).addTo(map);

        mapInstanceRef.current = map;

        // Map click handler for polygon drawing - ALWAYS ACTIVE
        map.on('click', (e: any) => {
          if (handleMapClickRef.current) {
            handleMapClickRef.current(e.latlng);
          }
        });

        // Double-click to finish polygon
        map.on('dblclick', (e: any) => {
          if (polygonPointsRef.current.length >= 3) {
            finishPolygon();
          }
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Calculate distance between two points in meters
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = point1[0] * Math.PI / 180;
    const lat2Rad = point2[0] * Math.PI / 180;
    const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
    const deltaLng = (point2[1] - point1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Handle map clicks for polygon drawing
  const handleMapClick = async (latlng: any) => {
    console.log('🖱️ Map clicked at:', latlng);
    
    if (!mapInstanceRef.current) {
      console.log('❌ No map instance');
      return;
    }

    // Don't allow modification if search is completed
    if (isSearchCompleted) {
      console.log('🚫 POLYGON LOCKED - Search completed. Click "Nueva Búsqueda" to start over.');
      console.log('🔒 isSearchCompleted:', isSearchCompleted);
      return;
    }

    try {
      const L = await import('leaflet');
      
      const newPoint: [number, number] = [latlng.lat, latlng.lng];
      
      // Check if we're trying to close the polygon (similar to first point)
      if (polygonPoints.length >= 3) {
        const firstPoint = polygonPoints[0];
        const distance = calculateDistance(newPoint, firstPoint);
        
        console.log('🔍 Distance to first point:', distance, 'meters');
        
        // If within 50 meters of first point, close polygon and search
        if (distance < 50) {
          console.log('🔄 Auto-closing polygon - close to first point');
          finishPolygon();
          return;
        }
      }
      
      const updatedPoints = [...polygonPoints, newPoint];
      
      console.log('📍 Adding point:', newPoint);
      console.log('📍 Updated points:', updatedPoints);
      
      setPolygonPoints(updatedPoints);

      // Update visual representation
      updatePolygonVisual(updatedPoints);

    } catch (error) {
      console.error('Error handling map click:', error);
    }
  };

  // Update the refs whenever they change
  useEffect(() => {
    handleMapClickRef.current = handleMapClick;
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints, isSearchCompleted]); // Include isSearchCompleted in dependencies

  // Update polygon visual as user draws
  const updatePolygonVisual = async (points: [number, number][]) => {
    console.log('🎨 Updating polygon visual with points:', points);
    
    if (!mapInstanceRef.current) {
      console.log('❌ No map instance for visual update');
      return;
    }

    try {
      const L = await import('leaflet');

      // Remove existing visuals
      if (currentPolygonRef.current) {
        mapInstanceRef.current.removeLayer(currentPolygonRef.current);
        currentPolygonRef.current = null;
      }
      if (currentLineRef.current) {
        mapInstanceRef.current.removeLayer(currentLineRef.current);
        currentLineRef.current = null;
      }

      if (points.length === 0) {
        console.log('🎨 No points to draw');
        return;
      }

      // Show filled polygon if 3+ points - PREVIEW MODE
      if (points.length >= 3) {
        console.log('🔵 Drawing bright blue polygon preview with', points.length, 'points');
        const polygon = L.polygon(points, {
          color: '#1e40af',        // Dark blue border for contrast
          weight: 4,
          opacity: 1,
          fillColor: '#3b82f6',    // Bright blue fill
          fillOpacity: 0.4,        // More visible fill
          interactive: false,
          className: 'drawing-polygon'
        }).addTo(mapInstanceRef.current);
        
        currentPolygonRef.current = polygon;
        console.log('✅ Bright blue polygon added to map');
        console.log('🎨 Polygon colors: border=#1e40af, fill=#3b82f6, opacity=0.4');
      } 
      // Show line if 2+ points - DRAWING MODE
      else if (points.length >= 2) {
        console.log('🔵 Drawing bright blue line with', points.length, 'points');
        const line = L.polyline(points, {
          color: '#1e40af',        // Dark blue line for visibility
          weight: 4,
          opacity: 1,
          interactive: false,
          className: 'drawing-line'
        }).addTo(mapInstanceRef.current);
        
        currentLineRef.current = line;
        console.log('✅ Bright blue line added to map');
        console.log('🎨 Line color: #1e40af, weight=4px');
      }
      // Show single point - START MODE
      else if (points.length === 1) {
        console.log('🔵 Drawing bright blue starting point');
        const marker = L.circleMarker(points[0], {
          color: '#1e40af',        // Dark blue border
          weight: 3,
          opacity: 1,
          fillColor: '#3b82f6',    // Bright blue fill
          fillOpacity: 0.8,
          radius: 8,               // Larger radius
          interactive: false,
          className: 'starting-point'
        }).addTo(mapInstanceRef.current);
        
        currentLineRef.current = marker;
        console.log('✅ Bright blue point added to map');
      }

    } catch (error) {
      console.error('Error updating polygon visual:', error);
    }
  };

  // Finish polygon and trigger search
  const finishPolygon = async () => {
    if (polygonPoints.length < 3) return;

    // Show final polygon with different color
    await showFinalPolygon(polygonPoints);

    // Convert to WKT format for API
    const wktPoints = polygonPoints.map(point => `${point[1]} ${point[0]}`).join(', ');
    const wkt = `POLYGON((${wktPoints}, ${polygonPoints[0][1]} ${polygonPoints[0][0]}))`;

    // Mark search as completed (locks polygon)
    setIsSearchCompleted(true);
    console.log('🔒 SEARCH COMPLETED - Polygon is now locked');

    // Trigger search with current filters
    onPolygonSearch(wkt, currentFilters);
  };

  // Show final polygon with search area color
  const showFinalPolygon = async (points: [number, number][]) => {
    if (!mapInstanceRef.current) return;

    try {
      const L = await import('leaflet');

      // Remove preview polygon
      if (currentPolygonRef.current) {
        mapInstanceRef.current.removeLayer(currentPolygonRef.current);
        currentPolygonRef.current = null;
      }

      // Show final search area polygon - very bright blue for maximum visibility
      const finalPolygon = L.polygon(points, {
        color: '#1e40af',        // Dark blue border for maximum contrast
        weight: 5,
        opacity: 1,
        fillColor: '#3b82f6',    // Bright blue fill
        fillOpacity: 0.5,        // Higher opacity for visibility
        interactive: false,
        className: 'final-search-polygon'  // Custom class for targeting
      }).addTo(mapInstanceRef.current);
      
      currentPolygonRef.current = finalPolygon;

    } catch (error) {
      console.error('Error showing final polygon:', error);
    }
  };

  // Clear all drawings and data
  const clearAll = () => {
    if (currentPolygonRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(currentPolygonRef.current);
      currentPolygonRef.current = null;
    }
    if (currentLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(currentLineRef.current);
      currentLineRef.current = null;
    }
    if (propertiesLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(propertiesLayerRef.current);
      propertiesLayerRef.current = null;
    }
    
    setPolygonPoints([]);
    setIsSearchCompleted(false); // Reset search state
    console.log('🧹 All cleared - ready for new search');
  };

  // Update properties display
  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return;

    const updateProperties = async () => {
      try {
        const L = await import('leaflet');

        // Remove existing properties layer
        if (propertiesLayerRef.current) {
          mapInstanceRef.current.removeLayer(propertiesLayerRef.current);
        }

        if (properties.length === 0) return;

        // Create layer group for properties
        const propertiesLayer = L.layerGroup();

        properties.forEach((property) => {
          if (property.wkt) {
            try {
              // Try to parse different WKT formats
              let coordinates: [number, number][] = [];
              
              // Check for POLYGON format
              const polygonMatch = property.wkt.match(/POLYGON\s*\(\s*\(\s*([\d.-]+\s+[\d.-]+(?:\s*,\s*[\d.-]+\s+[\d.-]+)*)\s*\)\s*\)/i);
              if (polygonMatch) {
                const coordsStr = polygonMatch[1];
                coordinates = coordsStr.split(',').map(coord => {
                  const [lng, lat] = coord.trim().split(/\s+/).map(parseFloat);
                  return [lat, lng] as [number, number];
                });
                
                // Create blue rectangle (polygon) for property
                const propertyPolygon = L.polygon(coordinates, {
                  color: '#3b82f6',        // Blue border
                  weight: 2,
                  opacity: 0.8,
                  fillColor: '#3b82f6',    // Blue fill
                  fillOpacity: 0.3,
                  interactive: true
                });

                // Handle property selection on click
                propertyPolygon.on('click', () => {
                  if (onPropertySelect) {
                    onPropertySelect(property);
                  }
                });

                propertiesLayer.addLayer(propertyPolygon);
                console.log('✅ Added blue property polygon for:', property.id);
              } else {
                // Try POINT format as fallback
                const pointMatch = property.wkt.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/i);
                if (pointMatch) {
                  const lng = parseFloat(pointMatch[1]);
                  const lat = parseFloat(pointMatch[2]);
                  
                  // Create blue square marker for point properties
                  const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                      className: 'property-marker',
                      html: '<div style="background: #3b82f6; width: 16px; height: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })
                  });

                  // Handle property selection on click
                  marker.on('click', () => {
                    if (onPropertySelect) {
                      onPropertySelect(property);
                    }
                  });

                  propertiesLayer.addLayer(marker);
                  console.log('✅ Added blue property marker for:', property.id);
                } else {
                  console.log('Could not parse WKT for property:', property.id, property.wkt);
                }
              }
            } catch (error) {
              console.error('Error parsing WKT for property:', property.id, error);
            }
          }
        });

        propertiesLayer.addTo(mapInstanceRef.current);
        propertiesLayerRef.current = propertiesLayer;

      } catch (error) {
        console.error('Error updating properties:', error);
      }
    };

    updateProperties();
  }, [properties, isClient, onPropertySelect]);

  if (!isClient) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Mapa de Búsqueda
            {properties.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({properties.length} propiedades)
              </span>
            )}
          </div>
        </CardTitle>
        
        {/* Simple Controls */}
        <div className="flex items-center gap-3 pt-2">
          {isSearchCompleted ? (
            // After search is completed - show harmonious "Nueva Búsqueda" button
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Búsqueda completada</span>
              </div>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                <Search className="w-4 h-4" />
                Nueva Búsqueda
              </Button>
            </div>
          ) : (
            // During polygon drawing - show normal controls
            <>
              {polygonPoints.length >= 3 && (
                <Button
                  onClick={finishPolygon}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Search className="w-4 h-4" />
                  Buscar ({polygonPoints.length} puntos)
                </Button>
              )}
              
              {polygonPoints.length > 0 && (
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar
                </Button>
              )}
            </>
          )}
        </div>

        {/* Visual status with color guidance */}
        {isSearchCompleted ? (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Área de búsqueda activa</strong> - Haz clic en "Nueva Búsqueda" para crear una nueva área.
            </p>
          </div>
        ) : polygonPoints.length === 0 ? (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium">
              👆 Haz clic directamente en el mapa para empezar a dibujar tu área de búsqueda
            </p>
          </div>
        ) : polygonPoints.length === 1 ? (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              🔵 <strong>Punto azul</strong> - Continúa haciendo clic para crear tu área (necesitas 2 más)
            </p>
          </div>
        ) : polygonPoints.length === 2 ? (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              🔵 <strong>Línea azul</strong> - Un clic más para crear el área de búsqueda
            </p>
          </div>
        ) : (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              🔵 <strong>Área azul (vista previa)</strong> - {polygonPoints.length} puntos - haz clic cerca del primer punto para cerrar y buscar
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-[600px]">
          <div 
            ref={mapRef}
            className="w-full h-full grayscale-map"
            style={{ 
              minHeight: '600px',
              cursor: isSearchCompleted ? 'not-allowed' : 'crosshair'
            }}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1001]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Buscando propiedades...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
