/**
 * TransaccionesTable Component
 * Displays transaction history with detailed information
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Search, ExternalLink } from 'lucide-react';

interface TransaccionData {
  predirecc?: string;
  fecha_documento_publico?: string;
  codigo?: string;
  nombre?: string;
  cuantia?: number;
  entidad?: string;
  numero_documento_publico?: string;
  oficina?: string;
  preaconst?: number;
  preaterre?: number;
  chip?: string;
  usosuelo?: string;
  tipo_documento_publico?: string;
  titular?: string;
  email?: string;
  tipo?: string;
  nrodocumento?: string;
  link?: string;
}

interface TransaccionesTableProps {
  data: TransaccionData[];
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

export default function TransaccionesTable({ data }: TransaccionesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.length === 0) return null;

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Transacciones ({data.length})
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 dark:bg-green-900/30 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-green-900 dark:text-green-100">
                Link
              </th>
              <th className="px-4 py-3 text-left font-semibold text-green-900 dark:text-green-100">
                Dirección
              </th>
              <th className="px-4 py-3 text-left font-semibold text-green-900 dark:text-green-100">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-green-900 dark:text-green-100">
                Tipo
              </th>
              <th className="px-4 py-3 text-right font-semibold text-green-900 dark:text-green-100">
                Cuantía
              </th>
              <th className="px-4 py-3 text-left font-semibold text-green-900 dark:text-green-100">
                Entidad
              </th>
              <th className="px-4 py-3 text-left font-semibold text-green-900 dark:text-green-100">
                N° Escritura
              </th>
              <th className="px-4 py-3 text-right font-semibold text-green-900 dark:text-green-100">
                Área Const.
              </th>
              <th className="px-4 py-3 text-right font-semibold text-green-900 dark:text-green-100">
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
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                    >
                      <ExternalLink className="w-4 h-4 inline" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.predirecc || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.fecha_documento_publico || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.nombre || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
                  {formatCurrency(row.cuantia)}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.entidad || '-'}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {row.numero_documento_publico || '-'}
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

