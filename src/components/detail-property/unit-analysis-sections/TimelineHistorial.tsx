/**
 * TimelineHistorial Component
 * Displays property history timeline from CTL annotations
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface Anotacion {
  fecha: string;
  tipo_acto: string;
  valor_acto?: number | string;
  personas?: {
    de?: string[];
    a?: string[];
  };
  estado?: string;
  numero?: number;
}

interface TimelineHistorialProps {
  anotaciones: Anotacion[];
}

const formatCurrency = (value: any): string => {
  if (value == null || isNaN(Number(value))) return '';
  return `$${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

const getTypeClass = (tipoActo: string): string => {
  const tipo = tipoActo.toUpperCase();
  if (tipo.includes('COMPRAVENTA')) return 'compraventa';
  if (tipo.includes('HIPOTECA')) return 'hipoteca';
  if (tipo.includes('CANCEL')) return 'cancelacion';
  if (tipo.includes('EMBARGO')) return 'embargo';
  if (tipo.includes('REGLAMENTO')) return 'reglamento';
  return 'otros';
};

const getTypeColor = (tipoClass: string): string => {
  const colors: Record<string, string> = {
    compraventa: 'bg-green-500',
    hipoteca: 'bg-amber-500',
    cancelacion: 'bg-cyan-500',
    embargo: 'bg-red-500',
    reglamento: 'bg-blue-500',
    otros: 'bg-gray-500'
  };
  return colors[tipoClass] || 'bg-gray-500';
};

export default function TimelineHistorial({ anotaciones }: TimelineHistorialProps) {
  // Debug logging
  console.log('🔍 TimelineHistorial - Data received:', {
    anotaciones,
    length: anotaciones?.length,
    firstItem: anotaciones?.[0]
  });

  if (!anotaciones || anotaciones.length === 0) {
    console.log('❌ TimelineHistorial - No data to display');
    return null;
  }

  const sortedAnotaciones = [...anotaciones].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <Card className="shadow-md">
      <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Historial del Inmueble ({anotaciones.length})
            </h3>
          </div>
          {/* Legend */}
          <div className="flex gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Compraventa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Hipoteca</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Cancelación</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-gray-600 dark:text-gray-400">Otros</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Timeline */}
        <div className="relative pl-8 space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-gray-300"></div>

          {sortedAnotaciones.map((anotacion, index) => {
            const tipoClass = getTypeClass(anotacion.tipo_acto);
            const colorClass = getTypeColor(tipoClass);
            const valorFormatted = anotacion.valor_acto ? formatCurrency(anotacion.valor_acto) : '';

            return (
              <div key={index} className="relative">
                {/* Timeline Marker */}
                <div className={`absolute -left-[26px] w-12 h-12 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-4 border-white dark:border-gray-800`}>
                  {anotacion.numero || index + 1}
                </div>

                {/* Timeline Content */}
                <Card className="ml-6 hover:shadow-md transition-shadow">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {formatDate(anotacion.fecha)}
                      </div>
                      <Badge 
                        className={
                          anotacion.estado === 'VIGENTE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }
                      >
                        {anotacion.estado || 'VIGENTE'}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {anotacion.tipo_acto}
                    </h4>

                    {/* Value */}
                    {valorFormatted && (
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {valorFormatted}
                      </div>
                    )}

                    {/* Participants */}
                    {(anotacion.personas?.de || anotacion.personas?.a) && (
                      <div className="space-y-2 text-sm">
                        {anotacion.personas.de && anotacion.personas.de.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
                              De:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {anotacion.personas.de.map((persona, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs border border-amber-200 dark:border-amber-700"
                                >
                                  {persona}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {anotacion.personas.a && anotacion.personas.a.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
                              A:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {anotacion.personas.a.map((persona, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-700"
                                >
                                  {persona}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

