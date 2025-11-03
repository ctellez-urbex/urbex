/**
 * PrediosTable Component
 * Displays detailed property registry information
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Building2, Search, SearchIcon } from 'lucide-react';

interface PredioData {
  predirecc?: string;
  usosuelo?: string;
  chip?: string;
  matriculainmobiliaria?: string;
  precedcata?: string;
  preaconst?: number;
  preaterre?: number;
  link?: string;
}

interface PrediosTableProps {
  data: PredioData[];
  onPredioClick?: (chip: string) => void;
}

const formatNumber = (value: any, decimals: number = 2): string => {
  if (value == null || isNaN(Number(value))) return '0';
  return Number(value).toLocaleString('es-CO', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export default function PrediosTable({ data, onPredioClick }: PrediosTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.length === 0) return null;

  const handlePredioClick = (chip?: string) => {
    if (chip && onPredioClick) {
      onPredioClick(chip);
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Predios ({data.length})
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-100 dark:bg-blue-900/30 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-blue-900 dark:text-blue-100">
                Link
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                Dirección
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                Uso del Suelo
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                Chip
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                Matrícula
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900 dark:text-blue-100">
                Cédula Catastral
              </th>
              <th className="px-4 py-3 text-right font-semibold text-blue-900 dark:text-blue-100">
                Área Const.
              </th>
              <th className="px-4 py-3 text-right font-semibold text-blue-900 dark:text-blue-100">
                Área Terreno
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-center">
                  {row.chip && (
                    <button
                      onClick={() => handlePredioClick(row.chip)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded transition-colors"
                      title="Ver análisis de unidad"
                    >
                      <SearchIcon className="w-4 h-4 inline" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.predirecc || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.usosuelo || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.chip || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.matriculainmobiliaria || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.precedcata || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaconst || 0)} m²
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaterre || 0)} m²
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredData.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No se encontraron resultados para "{searchTerm}"
        </div>
      )}
    </Card>
  );
}

