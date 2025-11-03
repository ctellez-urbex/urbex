'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Download, 
  ExternalLink, 
  User, 
  Building, 
  Calendar,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

export interface OwnerData {
  link?: string;
  direccion?: string;
  year?: number;
  avaluo_catastral?: number;
  impuesto_predial?: number;
  copropiedad?: string;
  preaconst?: number;
  preaterre?: number;
  matriculainmobiliaria?: string;
  chip?: string;
  tipoPropietario?: string;
  tipo?: string;
  identificacion?: string;
  nombre?: string;
  telefonos?: string;
  email?: string;
}

interface OwnersTableProps {
  data: OwnerData[];
  onDownloadExcel?: () => void;
}

export default function OwnersTable({ data, onDownloadExcel }: OwnersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof OwnerData; direction: 'asc' | 'desc' } | null>(null);

  // Filtrar datos basado en búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(owner => 
      Object.values(owner).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof OwnerData) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const formatCurrency = (value?: number) => {
    if (value == null) return 'Sin información';
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatNumber = (value?: number) => {
    if (value == null) return 'Sin información';
    return value.toLocaleString('es-CO');
  };

  const getOwnerTypeBadge = (tipo?: string) => {
    if (!tipo) return <Badge variant="secondary">Sin información</Badge>;
    
    const typeMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'PERSONA NATURAL': { variant: 'default', label: 'Persona Natural' },
      'PERSONA JURIDICA': { variant: 'secondary', label: 'Persona Jurídica' },
    };
    
    const config = typeMap[tipo] || { variant: 'outline', label: tipo };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    { key: 'link', label: 'Link', icon: ExternalLink },
    { key: 'direccion', label: 'Dirección', icon: Building },
    { key: 'year', label: 'Año', icon: Calendar },
    { key: 'avaluo_catastral', label: 'Avalúo Catastral', icon: FileText },
    { key: 'impuesto_predial', label: 'Impuesto Predial', icon: FileText },
    { key: 'copropiedad', label: 'Copropiedad', icon: Users },
    { key: 'preaconst', label: 'Área Construida', icon: Building },
    { key: 'preaterre', label: 'Área Terreno', icon: Building },
    { key: 'matriculainmobiliaria', label: 'Matrícula', icon: FileText },
    { key: 'chip', label: 'Chip', icon: FileText },
    { key: 'tipoPropietario', label: 'Tipo Propietario', icon: User },
    { key: 'tipo', label: 'Tipo Doc.', icon: FileText },
    { key: 'identificacion', label: 'Identificación', icon: FileText },
    { key: 'nombre', label: 'Nombre', icon: User },
    { key: 'telefonos', label: 'Teléfonos', icon: Phone },
    { key: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Propietarios ({filteredData.length} registros)
          </CardTitle>
          {onDownloadExcel && (
            <Button onClick={onDownloadExcel} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargar Excel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar en propietarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((column) => {
                  const Icon = column.icon;
                  const isSorted = sortConfig?.key === column.key;
                  const sortDirection = isSorted ? sortConfig.direction : null;
                  
                  return (
                    <th
                      key={column.key}
                      className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(column.key as keyof OwnerData)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{column.label}</span>
                        {isSorted && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((owner, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    {owner.link ? (
                      <a 
                        href={owner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 max-w-xs truncate" title={owner.direccion}>
                    {owner.direccion || 'Sin información'}
                  </td>
                  <td className="p-3 text-center">
                    {owner.year ? owner.year : 'Sin información'}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(owner.avaluo_catastral)}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(owner.impuesto_predial)}
                  </td>
                  <td className="p-3">
                    {owner.copropiedad || 'Sin información'}
                  </td>
                  <td className="p-3 text-right">
                    {formatNumber(owner.preaconst)} m²
                  </td>
                  <td className="p-3 text-right">
                    {formatNumber(owner.preaterre)} m²
                  </td>
                  <td className="p-3">
                    {owner.matriculainmobiliaria || 'Sin información'}
                  </td>
                  <td className="p-3 font-mono text-sm">
                    {owner.chip || 'Sin información'}
                  </td>
                  <td className="p-3">
                    {getOwnerTypeBadge(owner.tipoPropietario)}
                  </td>
                  <td className="p-3">
                    {owner.tipo || 'Sin información'}
                  </td>
                  <td className="p-3 font-mono text-sm">
                    {owner.identificacion || 'Sin información'}
                  </td>
                  <td className="p-3 max-w-xs truncate" title={owner.nombre}>
                    {owner.nombre || 'Sin información'}
                  </td>
                  <td className="p-3">
                    {owner.telefonos ? (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{owner.telefonos}</span>
                      </div>
                    ) : (
                      'Sin información'
                    )}
                  </td>
                  <td className="p-3">
                    {owner.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm truncate max-w-xs" title={owner.email}>
                          {owner.email}
                        </span>
                      </div>
                    ) : (
                      'Sin información'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {sortedData.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron propietarios con el criterio de búsqueda' : 'No hay datos de propietarios disponibles'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
