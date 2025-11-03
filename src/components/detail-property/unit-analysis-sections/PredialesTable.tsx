/**
 * PredialesTable Component
 * Displays cadastral appraisal and tax information with owner details
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Search, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface PredialData {
  chip?: string;
  year?: number;
  direccion?: string;
  avaluo_catastral?: number;
  impuesto_predial?: number;
  impuesto_total?: number;
  preaconst?: number;
  matriculainmobiliaria?: string;
  tipoPropietario?: string;
  tipo?: string;
  tipoDocumento?: string;
  nombre?: string;
  identificacion?: string;
  copropiedad?: number;
  indPago?: string;
  link?: string;
}

interface PredialesTableProps {
  data: PredialData[];
}

const formatCurrency = (value: any): string => {
  if (value == null || isNaN(Number(value))) return '-';
  return `$${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

const formatNumber = (value: any, decimals: number = 2): string => {
  if (value == null || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('es-CO', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

type SortConfig = {
  key: keyof PredialData;
  direction: 'asc' | 'desc';
} | null;

export default function PredialesTable({ data }: PredialesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  if (!data || data.length === 0) return null;

  // Generate link for each row based on year and chip
  const dataWithLinks = useMemo(() => {
    return data.map(row => {
      // Generate link if not present
      let link = row.link;
      if (!link && row.chip && row.year) {
        // Format: predial_link API endpoint would return the PDF link
        link = `https://api.urbex.com.co/predial_link?chip=${row.chip}&year=${row.year}`;
      }
      return { ...row, link };
    });
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return dataWithLinks.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataWithLinks, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof PredialData) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Remove sorting
    });
  };

  // Get sort icon for column
  const getSortIcon = (key: keyof PredialData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3" />
      : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Prediales | Avalúos Catastrales ({data.length})
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-purple-100 dark:bg-purple-900/30 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-purple-900 dark:text-purple-100">
                Link
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('direccion')}
              >
                <div className="flex items-center gap-1">
                  Dirección
                  {getSortIcon('direccion')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('year')}
              >
                <div className="flex items-center justify-center gap-1">
                  Año
                  {getSortIcon('year')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('avaluo_catastral')}
              >
                <div className="flex items-center justify-end gap-1">
                  Avalúo Catastral
                  {getSortIcon('avaluo_catastral')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('impuesto_predial')}
              >
                <div className="flex items-center justify-end gap-1">
                  Predial
                  {getSortIcon('impuesto_predial')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('preaconst')}
              >
                <div className="flex items-center justify-end gap-1">
                  Área Const.
                  {getSortIcon('preaconst')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('chip')}
              >
                <div className="flex items-center gap-1">
                  Chip
                  {getSortIcon('chip')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('matriculainmobiliaria')}
              >
                <div className="flex items-center gap-1">
                  Matrícula
                  {getSortIcon('matriculainmobiliaria')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('tipoPropietario')}
              >
                <div className="flex items-center gap-1">
                  Tipo Prop.
                  {getSortIcon('tipoPropietario')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('tipo')}
              >
                <div className="flex items-center gap-1">
                  Tipo Doc
                  {getSortIcon('tipo')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  Propietario
                  {getSortIcon('nombre')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('identificacion')}
              >
                <div className="flex items-center gap-1">
                  Identificación
                  {getSortIcon('identificacion')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('copropiedad')}
              >
                <div className="flex items-center justify-end gap-1">
                  Copropiedad
                  {getSortIcon('copropiedad')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => handleSort('indPago')}
              >
                <div className="flex items-center gap-1">
                  Ind. Pago
                  {getSortIcon('indPago')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-center">
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800"
                    >
                      <ExternalLink className="w-4 h-4 inline" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.direccion || '-'}</td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100 font-semibold">
                  {row.year || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
                  {formatCurrency(row.avaluo_catastral)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
                  {formatCurrency(row.impuesto_predial || row.impuesto_total)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaconst || 0)} m²
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.chip || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.matriculainmobiliaria || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.tipoPropietario || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.tipo || row.tipoDocumento || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.nombre || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.identificacion || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {row.copropiedad ? `${row.copropiedad}%` : '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.indPago || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {searchTerm 
            ? `No se encontraron resultados para "${searchTerm}"` 
            : 'No hay datos disponibles'}
        </div>
      )}
      {sortConfig && (
        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-xs text-purple-700 dark:text-purple-300 border-t border-purple-200 dark:border-purple-800">
          Ordenado por: <strong>{sortConfig.key}</strong> ({sortConfig.direction === 'asc' ? 'Ascendente ↑' : 'Descendente ↓'})
          <button
            onClick={() => setSortConfig(null)}
            className="ml-2 text-purple-600 dark:text-purple-400 hover:underline"
          >
            Limpiar orden
          </button>
        </div>
      )}
    </Card>
  );
}

