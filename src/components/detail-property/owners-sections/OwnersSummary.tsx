'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  FileText, 
  Calendar, 
  TrendingUp,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { OwnerData } from './OwnersTable';

interface OwnersSummaryProps {
  data: OwnerData[];
}

export default function OwnersSummary({ data }: OwnersSummaryProps) {
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalOwners: 0,
        totalProperties: 0,
        totalArea: 0,
        totalAvaluo: 0,
        totalPredial: 0,
        ownerTypes: { 'PERSONA NATURAL': 0, 'PERSONA JURIDICA': 0 },
        years: new Set<number>(),
        withEmail: 0,
        withPhone: 0,
        copropiedades: 0,
      };
    }

    const totalOwners = data.length;
    const totalProperties = new Set(data.map(d => d.chip).filter(Boolean)).size;
    const totalArea = data.reduce((sum, d) => sum + (d.preaterre || 0), 0);
    const totalAvaluo = data.reduce((sum, d) => sum + (d.avaluo_catastral || 0), 0);
    const totalPredial = data.reduce((sum, d) => sum + (d.impuesto_predial || 0), 0);
    
    const ownerTypes = data.reduce((acc, d) => {
      const type = d.tipoPropietario || 'Sin información';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const years = new Set(data.map(d => d.year).filter(Boolean));
    const withEmail = data.filter(d => d.email && d.email.trim() !== '').length;
    const withPhone = data.filter(d => d.telefonos && d.telefonos.trim() !== '').length;
    const copropiedades = data.filter(d => d.copropiedad && d.copropiedad.toLowerCase() !== 'no').length;

    return {
      totalOwners,
      totalProperties,
      totalArea,
      totalAvaluo,
      totalPredial,
      ownerTypes,
      years,
      withEmail,
      withPhone,
      copropiedades,
    };
  }, [data]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('es-CO');
  };

  const getOwnerTypeColor = (type: string) => {
    switch (type) {
      case 'PERSONA NATURAL':
        return 'bg-blue-100 text-blue-800';
      case 'PERSONA JURIDICA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Resumen General */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Propietarios:</span>
            <span className="font-semibold text-lg">{summary.totalOwners}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Propiedades:</span>
            <span className="font-semibold text-lg">{summary.totalProperties}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Copropiedades:</span>
            <span className="font-semibold text-lg">{summary.copropiedades}</span>
          </div>
        </CardContent>
      </Card>

      {/* Áreas y Valores */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Áreas y Valores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Área Total:</span>
            <span className="font-semibold">{formatNumber(summary.totalArea)} m²</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avalúo Total:</span>
            <span className="font-semibold text-green-600">{formatCurrency(summary.totalAvaluo)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Predial Total:</span>
            <span className="font-semibold text-orange-600">{formatCurrency(summary.totalPredial)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Propietarios */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Tipos de Propietarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(summary.ownerTypes).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <Badge className={getOwnerTypeColor(type)}>
                {type === 'PERSONA NATURAL' ? 'Persona Natural' : 
                 type === 'PERSONA JURIDICA' ? 'Persona Jurídica' : type}
              </Badge>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Con Email:</span>
            <span className="font-semibold">{summary.withEmail}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Con Teléfono:</span>
            <span className="font-semibold">{summary.withPhone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">% Con Email:</span>
            <span className="font-semibold">
              {summary.totalOwners > 0 ? Math.round((summary.withEmail / summary.totalOwners) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Años de Registro */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            Años de Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(summary.years).sort((a, b) => (b || 0) - (a || 0)).map(year => (
              <Badge key={year} variant="outline" className="text-sm">
                {year}
              </Badge>
            ))}
          </div>
          {summary.years.size === 0 && (
            <p className="text-gray-500 text-sm">Sin información de años</p>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas Adicionales */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Promedio Área:</span>
            <span className="font-semibold">
              {summary.totalProperties > 0 ? formatNumber(summary.totalArea / summary.totalProperties) : 0} m²
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Promedio Avalúo:</span>
            <span className="font-semibold">
              {summary.totalProperties > 0 ? formatCurrency(summary.totalAvaluo / summary.totalProperties) : '$0'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Promedio Predial:</span>
            <span className="font-semibold">
              {summary.totalProperties > 0 ? formatCurrency(summary.totalPredial / summary.totalProperties) : '$0'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
