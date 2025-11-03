/**
 * CTLTable Component
 * Displays Certificados de Libertad y Tradición (Property Title Certificates)
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Search, ExternalLink } from 'lucide-react';

interface CTLData {
  fecha?: string;
  predirecc?: string;
  chip?: string;
  matriculainmobiliaria?: string;
  cedula_catastral?: string;
  preaconst?: number;
  link?: string;
}

interface CTLTableProps {
  data: CTLData[];
}

const formatNumber = (value: any, decimals: number = 2): string => {
  if (value == null || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('es-CO', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export default function CTLTable({ data }: CTLTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.length === 0) return null;

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Certificados de Libertad y Tradición ({data.length})
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-orange-100 dark:bg-orange-900/30 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-orange-900 dark:text-orange-100">
                Link
              </th>
              <th className="px-4 py-3 text-left font-semibold text-orange-900 dark:text-orange-100">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-orange-900 dark:text-orange-100">
                Dirección
              </th>
              <th className="px-4 py-3 text-left font-semibold text-orange-900 dark:text-orange-100">
                Chip
              </th>
              <th className="px-4 py-3 text-left font-semibold text-orange-900 dark:text-orange-100">
                Matrícula Inmobiliaria
              </th>
              <th className="px-4 py-3 text-left font-semibold text-orange-900 dark:text-orange-100">
                Cédula Catastral
              </th>
              <th className="px-4 py-3 text-right font-semibold text-orange-900 dark:text-orange-100">
                Área Construida
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
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                    >
                      <ExternalLink className="w-4 h-4 inline" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.fecha || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.predirecc || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.chip || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.matriculainmobiliaria || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.cedula_catastral || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaconst || 0)} m²
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

