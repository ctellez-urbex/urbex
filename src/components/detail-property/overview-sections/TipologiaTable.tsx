/**
 * TipologiaTable Component
 * Displays property typology breakdown
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface TipologiaData {
  usosuelo: string;
  predios_precuso: number;
  preaconst_precuso: number;
  preaconst_precusoprop: number;
  preaterre_precuso: number;
}

interface TipologiaTableProps {
  data: TipologiaData[];
}

const formatNumber = (value: any, decimals: number = 2): string => {
  if (value == null || isNaN(Number(value))) return '0';
  return Number(value).toLocaleString('es-CO', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export default function TipologiaTable({ data }: TipologiaTableProps) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tipología</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-purple-100 dark:bg-purple-900/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100">
                Tipología
              </th>
              <th className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100">
                Predios
              </th>
              <th className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100">
                Área Construida
              </th>
              <th className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100">
                Proporción
              </th>
              <th className="px-4 py-3 text-right font-semibold text-purple-900 dark:text-purple-100">
                Área de Terreno
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  {row.usosuelo || '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {Math.floor(row.predios_precuso || 0)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaconst_precuso || 0)} m²
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaconst_precusoprop || 0)}%
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row.preaterre_precuso || 0)} m²
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

