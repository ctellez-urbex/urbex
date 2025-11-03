'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { OwnersResponse } from '@/config/api-detail-property';
import {
  OwnersTable,
  OwnersSummary,
  OwnersFilters,
  OwnerData,
  OwnersFiltersData
} from './owners-sections';

export interface OwnersProps {
  data: Partial<OwnersResponse>;
}

export default function Owners({ data }: OwnersProps) {
  const [ownersData, setOwnersData] = useState<OwnerData[]>([]);
  const [filters, setFilters] = useState<OwnersFiltersData>({
    searchTerm: '',
    ownerType: 'all',
    year: 'all',
    hasEmail: false,
    hasPhone: false,
    copropiedad: 'all',
    minArea: '',
    maxArea: '',
    minAvaluo: '',
    maxAvaluo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(true);

  // Procesar datos de propietarios
  useEffect(() => {
    const processOwnersData = async () => {
      setIsProcessingData(true);
      
      try {
        console.log('🔄 Procesando datos de propietarios...');
        
        // Obtener datos de la API de propietarios
        const data_caracteristicas = data?.data_caracteristicas || {};
        const data_prediales_actuales = data?.data_prediales_actuales || {};
        const data_propietarios = data?.data_propietarios || {};

        // Procesar lista de predios
        const lista_predios = data_caracteristicas?.lista_predios || [];
        const tabla_prediales_actuales = data_prediales_actuales?.data || [];
        const tabla_propietarios = data_propietarios?.data || [];

        console.log('📊 Datos recibidos:', {
          lista_predios: lista_predios.length,
          tabla_prediales_actuales: tabla_prediales_actuales.length,
          tabla_propietarios: tabla_propietarios.length
        });

        let processedData: OwnerData[] = [];

        // 1. Crear DataFrame base con lista de predios
        if (lista_predios.length > 0) {
          processedData = lista_predios.map((predio: any) => ({
            chip: predio.chip,
            direccion: predio.direccion || predio.predirecc,
            preaconst: predio.preaconst,
            preaterre: predio.preaterre,
            matriculainmobiliaria: predio.matriculainmobiliaria,
            year: predio.year,
          }));
          
          // Eliminar duplicados por chip
          const uniqueChips = new Map();
          processedData.forEach(predio => {
            if (!uniqueChips.has(predio.chip)) {
              uniqueChips.set(predio.chip, predio);
            }
          });
          processedData = Array.from(uniqueChips.values());
        }

        // 2. Merge con datos de propietarios (más reciente por chip)
        if (processedData.length > 0 && tabla_propietarios.length > 0) {
          const propietariosMap = new Map();
          
          // Agrupar propietarios por chip y obtener el más reciente
          tabla_propietarios.forEach((prop: any) => {
            const key = prop.chip;
            if (!propietariosMap.has(key) || prop.year > propietariosMap.get(key).year) {
              propietariosMap.set(key, prop);
            }
          });

          // Merge con datos principales
          processedData = processedData.map(predio => {
            const propietario = propietariosMap.get(predio.chip);
            if (propietario) {
              return {
                ...predio,
                ...propietario,
                link: propietario.url || propietario.link,
              };
            }
            return predio;
          });
        }

        // 3. Merge con datos de prediales (avalúo e impuesto)
        if (processedData.length > 0 && tabla_prediales_actuales.length > 0) {
          const predialesMap = new Map();
          
          // Ordenar por chip y year, y tomar el más reciente
          const sortedPrediales = [...tabla_prediales_actuales].sort((a: any, b: any) => {
            if (a.chip === b.chip) {
              return (b.year || 0) - (a.year || 0);
            }
            return 0;
          });
          
          sortedPrediales.forEach((predial: any) => {
            const key = `${predial.chip}_${predial.year}`;
            if (!predialesMap.has(key)) {
              predialesMap.set(key, predial);
            }
          });

          processedData = processedData.map(predio => {
            const key = `${predio.chip}_${predio.year}`;
            const predial = predialesMap.get(key);
            if (predial) {
              return {
                ...predio,
                avaluo_catastral: predial.avaluo_catastral,
                impuesto_predial: predial.impuesto_predial,
              };
            }
            return predio;
          });
        }

        // 4. Merge adicional con prediales para completar información de propietarios
        if (processedData.length > 0 && tabla_prediales_actuales.length > 0) {
          const predialesInfoMap = new Map();
          
          tabla_prediales_actuales.forEach((predial: any) => {
            const key = predial.chip;
            if (!predialesInfoMap.has(key) || predial.year > predialesInfoMap.get(key).year) {
              predialesInfoMap.set(key, predial);
            }
          });

          processedData = processedData.map(predio => {
            const predialInfo = predialesInfoMap.get(predio.chip);
            if (predialInfo) {
              return {
                ...predio,
                tipo: predio.tipo || predialInfo.tipo,
                identificacion: predio.identificacion || predialInfo.identificacion,
                tipoPropietario: predio.tipoPropietario || predialInfo.tipoPropietario,
                nombre: predio.nombre || predialInfo.nombre,
                email: predio.email || predialInfo.email,
                telefonos: predio.telefonos || predialInfo.telefonos,
                link: predio.link || predialInfo.url || predialInfo.link,
                copropiedad: predio.copropiedad || predialInfo.copropiedad,
              };
            }
            return predio;
          });
        }

        // 5. Ajustar direcciones
        processedData = processedData.map(predio => {
          if (!predio.direccion && predio.chip) {
            // Intentar obtener dirección de otras fuentes si está disponible
            const predioOriginal = lista_predios.find((p: any) => p.chip === predio.chip);
            if (predioOriginal) {
              predio.direccion = predioOriginal.direccion || predioOriginal.predirecc;
            }
          }
          return predio;
        });

        // 6. Convertir year a número
        processedData = processedData.map(predio => {
          if (predio.year) {
            const yearNum = parseInt(String(predio.year), 10);
            if (!isNaN(yearNum)) {
              predio.year = yearNum;
            }
          }
          return predio;
        });

        // 7. Filtrar datos (excluir parqueaderos, depósitos, etc.)
        processedData = processedData.filter(predio => {
          const chipStr = predio.chip?.toString();
          if (chipStr && chipStr.length > 9) {
            const precuso = chipStr.substring(6, 9);
            return !['048', '049', '051'].includes(precuso);
          }
          return true;
        });

        // 8. Asignar tipo de propietario si no existe
        processedData = processedData.map(predio => {
          if (!predio.tipoPropietario && predio.tipo) {
            const tipoDoc = predio.tipo.replace(/[^a-zA-Z]/g, '').toUpperCase();
            if (['CC', 'TI', 'PA', 'CE'].includes(tipoDoc)) {
              predio.tipoPropietario = 'PERSONA NATURAL';
            } else if (['NIT', 'NI'].includes(tipoDoc)) {
              predio.tipoPropietario = 'PERSONA JURIDICA';
            }
          }
          return predio;
        });

        console.log('✅ Datos procesados:', processedData.length, 'propietarios');
        setOwnersData(processedData);
      } catch (error) {
        console.error('❌ Error procesando datos de propietarios:', error);
        setOwnersData([]);
      } finally {
        setIsProcessingData(false);
      }
    };

    processOwnersData();
  }, [data]);

  // Aplicar filtros a los datos
  const filteredData = useMemo(() => {
    return ownersData.filter(owner => {
      // Búsqueda general
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = [
          owner.nombre,
          owner.direccion,
          owner.identificacion,
          owner.chip,
          owner.email,
          owner.telefonos
        ].filter(Boolean).map(field => field?.toString().toLowerCase() || '');
        
        if (!searchableFields.some(field => field.includes(searchLower))) {
          return false;
        }
      }

      // Tipo de propietario
      if (filters.ownerType !== 'all' && owner.tipoPropietario !== filters.ownerType) {
        return false;
      }

      // Año
      if (filters.year !== 'all' && owner.year?.toString() !== filters.year) {
        return false;
      }

      // Copropiedad
      if (filters.copropiedad !== 'all' && owner.copropiedad !== filters.copropiedad) {
        return false;
      }

      // Con email
      if (filters.hasEmail && (!owner.email || owner.email.trim() === '')) {
        return false;
      }

      // Con teléfono
      if (filters.hasPhone && (!owner.telefonos || owner.telefonos.trim() === '')) {
        return false;
      }

      // Área mínima
      if (filters.minArea && (owner.preaterre || 0) < parseFloat(filters.minArea)) {
        return false;
      }

      // Área máxima
      if (filters.maxArea && (owner.preaterre || 0) > parseFloat(filters.maxArea)) {
        return false;
      }

      // Avalúo mínimo
      if (filters.minAvaluo && (owner.avaluo_catastral || 0) < parseFloat(filters.minAvaluo)) {
        return false;
      }

      // Avalúo máximo
      if (filters.maxAvaluo && (owner.avaluo_catastral || 0) > parseFloat(filters.maxAvaluo)) {
        return false;
      }

      return true;
    });
  }, [ownersData, filters]);

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    
    try {
      console.log('📥 Preparando descarga de Excel...');
      
      // Preparar datos para exportación (limitar a 1000 registros)
      const maxRecords = 1000;
      const dataToExport = filteredData.slice(0, maxRecords);
      
      if (filteredData.length > maxRecords) {
        alert(`Por políticas de manejo de la información se permite bajar un máximo de ${maxRecords} registros. Si necesita más información, por favor póngase en contacto con un comercial de Urbex.`);
      }
      
      const exportData = dataToExport.map(owner => ({
        'Link': owner.link || '',
        'Dirección': owner.direccion || '',
        'Chip': owner.chip || '',
        'Avalúo Catastral': owner.avaluo_catastral || 0,
        'Impuesto Predial': owner.impuesto_predial || 0,
        'Copropiedad': owner.copropiedad || '',
        'Área construida': owner.preaconst || 0,
        'Área de terreno': owner.preaterre || 0,
        'Tipo de Propietario': owner.tipoPropietario || '',
        'Tipo de Documento': owner.tipo || '',
        'Identificación': owner.identificacion || '',
        'Nombre': owner.nombre || '',
        'Teléfonos': owner.telefonos || '',
        'Correo Electrónico': owner.email || '',
        'Matrícula inmobiliaria': owner.matriculainmobiliaria || '',
        'Año': owner.year || '',
      }));

      // Crear CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `propietarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Excel descargado exitosamente');
    } catch (error) {
      console.error('❌ Error descargando Excel:', error);
      alert('Error al descargar el archivo. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Propietarios</h1>
        </div>
        <p className="text-orange-100 text-lg">
          Información de propietarios y datos demográficos del sector
        </p>
      </div>

      {/* Loading State */}
      {isProcessingData && (
        <Card className="shadow-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Procesando datos de propietarios...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isProcessingData && ownersData.length > 0 && (
        <>
          {/* Resumen */}
          <OwnersSummary data={ownersData} />

          {/* Filtros */}
          <OwnersFilters
            onFiltersChange={setFilters}
            initialFilters={filters}
            data={ownersData}
          />

          {/* Tabla de Propietarios */}
          <OwnersTable
            data={filteredData}
            onDownloadExcel={handleDownloadExcel}
          />

          {/* Loading para descarga */}
          {isLoading && (
            <Card className="shadow-md">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto mb-2" />
                  <p className="text-gray-600">Preparando archivo Excel...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isProcessingData && ownersData.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              No hay datos de propietarios disponibles
            </h3>
            <p className="text-gray-400">
              La información de propietarios se cargará cuando esté disponible
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

