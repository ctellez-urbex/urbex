/**
 * MarketFilters Component
 * Displays filters for market study analysis
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface MarketFiltersProps {
  onFiltersChange: (filters: MarketFiltersData) => void;
  initialFilters?: Partial<MarketFiltersData>;
}

export interface MarketFiltersData {
  metros: number;
  tipoInmueble: string[];
  tipoUso: string[];
  areaMin: number;
  areaMax: number;
  estratoMin: number;
  estratoMax: number;
  desdeAntiguedad: number;
  hastaAntiguedad: number;
  precuso: string[];
}

const TIPOS_INMUEBLE = [
  'Apartamento',
  'Casa',
  'Local',
  'Oficina',
  'Bodega',
  'Lote',
  'Finca',
  'Edificio'
];

const TIPOS_USO = [
  'Residencial',
  'Comercial',
  'Industrial',
  'Mixto',
  'Institucional',
  'Recreativo'
];

export default function MarketFilters({ onFiltersChange, initialFilters }: MarketFiltersProps) {
  const [filters, setFilters] = useState<MarketFiltersData>({
    metros: initialFilters?.metros || 500,
    tipoInmueble: initialFilters?.tipoInmueble || [],
    tipoUso: initialFilters?.tipoUso || [],
    areaMin: initialFilters?.areaMin || 0,
    areaMax: initialFilters?.areaMax || 0,
    estratoMin: initialFilters?.estratoMin || 0,
    estratoMax: initialFilters?.estratoMax || 0,
    desdeAntiguedad: initialFilters?.desdeAntiguedad || 0,
    hastaAntiguedad: initialFilters?.hastaAntiguedad || new Date().getFullYear(),
    precuso: initialFilters?.precuso || []
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof MarketFiltersData, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTipoInmuebleChange = (value: string) => {
    const newTipoInmueble = filters.tipoInmueble.includes(value)
      ? filters.tipoInmueble.filter(t => t !== value)
      : [...filters.tipoInmueble, value];
    handleFilterChange('tipoInmueble', newTipoInmueble);
  };

  const handleTipoUsoChange = (value: string) => {
    const newTipoUso = filters.tipoUso.includes(value)
      ? filters.tipoUso.filter(t => t !== value)
      : [...filters.tipoUso, value];
    handleFilterChange('tipoUso', newTipoUso);
  };

  const clearFilters = () => {
    const defaultFilters: MarketFiltersData = {
      metros: 500,
      tipoInmueble: [],
      tipoUso: [],
      areaMin: 0,
      areaMax: 0,
      estratoMin: 0,
      estratoMax: 0,
      desdeAntiguedad: 0,
      hastaAntiguedad: new Date().getFullYear(),
      precuso: []
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.tipoInmueble.length > 0,
    filters.tipoUso.length > 0,
    filters.areaMin > 0 || filters.areaMax > 0,
    filters.estratoMin > 0 || filters.estratoMax > 0,
    filters.desdeAntiguedad > 0 || filters.hastaAntiguedad < new Date().getFullYear()
  ].filter(Boolean).length;

  return (
    <Card className="shadow-md">
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Filtros de Análisis
            </h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {activeFiltersCount} activos
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 space-y-6">
          {/* Radio de búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metros">Radio de búsqueda (metros)</Label>
              <Select
                value={filters.metros.toString()}
                onValueChange={(value) => handleFilterChange('metros', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 metros</SelectItem>
                  <SelectItem value="200">200 metros</SelectItem>
                  <SelectItem value="300">300 metros</SelectItem>
                  <SelectItem value="400">400 metros</SelectItem>
                  <SelectItem value="500">500 metros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipo de inmueble */}
          <div>
            <Label>Tipo de inmueble</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TIPOS_INMUEBLE.map((tipo) => (
                <Badge
                  key={tipo}
                  variant={filters.tipoInmueble.includes(tipo) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.tipoInmueble.includes(tipo)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'hover:bg-green-100 dark:hover:bg-green-900'
                  }`}
                  onClick={() => handleTipoInmuebleChange(tipo)}
                >
                  {tipo}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tipo de uso */}
          <div>
            <Label>Tipo de uso</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TIPOS_USO.map((uso) => (
                <Badge
                  key={uso}
                  variant={filters.tipoUso.includes(uso) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.tipoUso.includes(uso)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'hover:bg-green-100 dark:hover:bg-green-900'
                  }`}
                  onClick={() => handleTipoUsoChange(uso)}
                >
                  {uso}
                </Badge>
              ))}
            </div>
          </div>

          {/* Área construida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="areaMin">Área construida mínima (m²)</Label>
              <Input
                id="areaMin"
                type="number"
                min="0"
                value={filters.areaMin}
                onChange={(e) => handleFilterChange('areaMin', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="areaMax">Área construida máxima (m²)</Label>
              <Input
                id="areaMax"
                type="number"
                min="0"
                value={filters.areaMax}
                onChange={(e) => handleFilterChange('areaMax', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Estrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estratoMin">Estrato mínimo</Label>
              <Select
                value={filters.estratoMin.toString()}
                onValueChange={(value) => handleFilterChange('estratoMin', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((estrato) => (
                    <SelectItem key={estrato} value={estrato.toString()}>
                      {estrato === 0 ? 'Sin estrato' : `Estrato ${estrato}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estratoMax">Estrato máximo</Label>
              <Select
                value={filters.estratoMax.toString()}
                onValueChange={(value) => handleFilterChange('estratoMax', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((estrato) => (
                    <SelectItem key={estrato} value={estrato.toString()}>
                      {estrato === 0 ? 'Sin estrato' : `Estrato ${estrato}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Antigüedad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="desdeAntiguedad">Año de construcción desde</Label>
              <Input
                id="desdeAntiguedad"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={filters.desdeAntiguedad}
                onChange={(e) => handleFilterChange('desdeAntiguedad', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="hastaAntiguedad">Año de construcción hasta</Label>
              <Input
                id="hastaAntiguedad"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={filters.hastaAntiguedad}
                onChange={(e) => handleFilterChange('hastaAntiguedad', parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
