'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Download, 
  Map, 
  Building, 
  Ruler, 
  Calculator,
  FileText,
  ExternalLink
} from 'lucide-react';

export interface SimulationResultsData {
  // Resumen general
  area_total_construida?: number;
  area_total_vendible?: number;
  recaudo_estimado?: number;
  avaluo_catastral_total?: number;
  avaluo_catastral_suelo_mt2?: number;
  propietarios?: number;
  
  // Información del terreno
  area_terreno?: number;
  area_construida_actual?: number;
  estrato?: number;
  numero_predios?: number;
  pisos_maximos_construidos?: number;
  sotanos?: number;
  antiguedad_minima?: number;
  antiguedad_maxima?: number;
  esquinero?: string;
  via_principal?: string;
  impuesto_predial_total?: number;
  predial_suelo_mt2?: number;
  
  // Supuestos del análisis
  area_poligono?: number;
  aislamiento_frontal?: number;
  aislamiento_lateral?: number;
  aislamiento_posterior?: number;
  area_terreno_despues_aislamientos?: number;
  voladizo_frontal?: number;
  voladizo_lateral?: number;
  voladizo_posterior?: number;
  superficie_edificio?: number;
  numero_pisos?: number;
  altura?: number;
  area_total_construida_supuestos?: number;
  area_total_vendible_supuestos?: number;
  numero_lotes_colindantes?: number;
  maximo_pisos_colindantes?: number;
  
  // Tabla de plantas
  tabla_plantas?: Array<{
    de_planta: number;
    a_planta: number;
    superficie_construida_planta: number;
    superficie_vendible_planta: number;
    superficie_construida_total: number;
    superficie_vendible_total: number;
  }>;
  
  // Tabla de recaudo
  tabla_recaudo?: Array<{
    tipo_inmueble: string;
    precio_mt2: string;
    superficie_construida: number;
    superficie_vendible: number;
    recaudo: string;
  }>;
  
  // Información POT
  pot_info?: {
    tipo_tratamiento?: string;
    tipologia?: string;
    acto_admin?: string;
    altura_maxima_tratamiento?: string;
    area_actividad?: string;
    actuacion_estrategica?: string;
    priorizacion?: string;
    antejardin_descripcion?: string;
    antejardin_dimension?: string;
    altura_aeronautica?: string;
    elevacion_aeronautica?: string;
    clasificacion_suelo?: string;
    perimetro_urbano?: string;
    upl?: string;
  };
}

interface SimulationResultsProps {
  data: SimulationResultsData;
  onGeneratePDF?: () => void;
  onViewNewProjects?: () => void;
}

export default function SimulationResults({ 
  data, 
  onGeneratePDF, 
  onViewNewProjects 
}: SimulationResultsProps) {
  const formatNumber = (value?: number, decimals: number = 2) => {
    if (value === undefined || value === null) return 'Sin información';
    return value.toLocaleString('es-CO', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'Sin información';
    return `$${value.toLocaleString('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'Sin información';
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resultados de la Simulación</h2>
          <p className="text-gray-600">Análisis de cabida y potencial de desarrollo</p>
        </div>
        <div className="flex gap-2">
          {onGeneratePDF && (
            <Button onClick={onGeneratePDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generar PDF
            </Button>
          )}
          {onViewNewProjects && (
            <Button variant="outline" onClick={onViewNewProjects} className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver Proyectos Nuevos
            </Button>
          )}
        </div>
      </div>

      {/* Resumen General */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área total construida:</p>
              <p className="text-lg font-semibold">{formatNumber(data.area_total_construida)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área total vendible:</p>
              <p className="text-lg font-semibold">{formatNumber(data.area_total_vendible)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Recaudo estimado:</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(data.recaudo_estimado)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Avalúo catastral total:</p>
              <p className="text-lg font-semibold">{formatCurrency(data.avaluo_catastral_total)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Avalúo catastral del suelo por m²:</p>
              <p className="text-lg font-semibold">{formatCurrency(data.avaluo_catastral_suelo_mt2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Propietarios:</p>
              <p className="text-lg font-semibold">{data.propietarios || 'Sin información'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Terreno */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Información del Terreno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área de terreno:</p>
              <p className="font-medium">{formatNumber(data.area_terreno)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área construida actual:</p>
              <p className="font-medium">{formatNumber(data.area_construida_actual)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Estrato:</p>
              <Badge variant="secondary">{data.estrato || 'Sin información'}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Número de predios:</p>
              <p className="font-medium">{data.numero_predios || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Pisos máximos construidos:</p>
              <p className="font-medium">{data.pisos_maximos_construidos || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Sótanos:</p>
              <p className="font-medium">{data.sotanos || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Antigüedad mínima:</p>
              <p className="font-medium">{data.antiguedad_minima || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Antigüedad máxima:</p>
              <p className="font-medium">{data.antiguedad_maxima || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Esquinero:</p>
              <Badge variant={data.esquinero === 'Sí' ? 'default' : 'secondary'}>
                {data.esquinero || 'No'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Vía principal:</p>
              <p className="font-medium">{data.via_principal || 'No'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Impuesto predial total:</p>
              <p className="font-medium">{formatCurrency(data.impuesto_predial_total)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Predial del suelo por m²:</p>
              <p className="font-medium">{formatCurrency(data.predial_suelo_mt2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supuestos del Análisis */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-orange-600" />
            Supuestos del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área del polígono:</p>
              <p className="font-medium">{formatNumber(data.area_poligono)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Aislamiento frontal:</p>
              <p className="font-medium">{data.aislamiento_frontal || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Aislamiento lateral:</p>
              <p className="font-medium">{data.aislamiento_lateral || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Aislamiento posterior:</p>
              <p className="font-medium">{data.aislamiento_posterior || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Área después de aislamientos:</p>
              <p className="font-medium">{formatNumber(data.area_terreno_despues_aislamientos)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Voladizo frontal:</p>
              <p className="font-medium">{data.voladizo_frontal || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Voladizo lateral:</p>
              <p className="font-medium">{data.voladizo_lateral || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Voladizo posterior:</p>
              <p className="font-medium">{data.voladizo_posterior || 0} m</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Superficie edificio:</p>
              <p className="font-medium">{formatNumber(data.superficie_edificio)} m²</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Número de pisos:</p>
              <p className="font-medium">{data.numero_pisos || 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Altura:</p>
              <p className="font-medium">{data.altura ? `${data.altura.toFixed(1)} m` : 'Sin información'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Número de lotes colindantes:</p>
              <p className="font-medium">{data.numero_lotes_colindantes || 'Sin información'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Plantas */}
      {data.tabla_plantas && data.tabla_plantas.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Distribución por Plantas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">De la planta</th>
                    <th className="text-left p-2">A la planta</th>
                    <th className="text-right p-2">Superficie construida planta</th>
                    <th className="text-right p-2">Superficie vendible planta</th>
                    <th className="text-right p-2">Superficie construida total</th>
                    <th className="text-right p-2">Superficie vendible total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tabla_plantas.map((planta, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{planta.de_planta}</td>
                      <td className="p-2">{planta.a_planta}</td>
                      <td className="text-right p-2">{formatNumber(planta.superficie_construida_planta)} m²</td>
                      <td className="text-right p-2">{formatNumber(planta.superficie_vendible_planta)} m²</td>
                      <td className="text-right p-2">{formatNumber(planta.superficie_construida_total)} m²</td>
                      <td className="text-right p-2">{formatNumber(planta.superficie_vendible_total)} m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Recaudo */}
      {data.tabla_recaudo && data.tabla_recaudo.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Recaudo Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Tipo inmueble</th>
                    <th className="text-right p-2">Precio mt²</th>
                    <th className="text-right p-2">Superficie construida</th>
                    <th className="text-right p-2">Superficie vendible</th>
                    <th className="text-right p-2">Recaudo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tabla_recaudo.map((recaudo, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{recaudo.tipo_inmueble}</td>
                      <td className="text-right p-2">{recaudo.precio_mt2}</td>
                      <td className="text-right p-2">{formatNumber(recaudo.superficie_construida)} m²</td>
                      <td className="text-right p-2">{formatNumber(recaudo.superficie_vendible)} m²</td>
                      <td className="text-right p-2 font-semibold">{recaudo.recaudo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información POT */}
      {data.pot_info && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-red-600" />
              Información del P.O.T
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.pot_info).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </p>
                  <p className="font-medium">{value || 'Sin información'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
