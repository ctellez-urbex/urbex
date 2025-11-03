'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Search, 
  X, 
  Calendar,
  User,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { OwnerData } from './OwnersTable';

export interface OwnersFiltersData {
  searchTerm: string;
  ownerType: string;
  year: string;
  hasEmail: boolean;
  hasPhone: boolean;
  copropiedad: string;
  minArea: string;
  maxArea: string;
  minAvaluo: string;
  maxAvaluo: string;
}

interface OwnersFiltersProps {
  onFiltersChange: (filters: OwnersFiltersData) => void;
  initialFilters?: Partial<OwnersFiltersData>;
  data: OwnerData[];
}

export default function OwnersFilters({ 
  onFiltersChange, 
  initialFilters = {},
  data 
}: OwnersFiltersProps) {
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
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Obtener opciones únicas para los filtros
  const ownerTypes = Array.from(new Set(data.map(d => d.tipoPropietario).filter(Boolean)));
  const years = Array.from(new Set(data.map(d => d.year).filter(Boolean))).sort((a, b) => (b || 0) - (a || 0));
  const copropiedades = Array.from(new Set(data.map(d => d.copropiedad).filter(Boolean)));

  const handleFilterChange = (key: keyof OwnersFiltersData, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: OwnersFiltersData = {
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all' && value !== false
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filtros de Búsqueda
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
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
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Menos' : 'Más'} filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Búsqueda Principal */}
        <div className="mb-4">
          <Label htmlFor="search">Búsqueda General</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Buscar por nombre, dirección, identificación..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Tipo de Propietario</Label>
            <Select value={filters.ownerType} onValueChange={(value) => handleFilterChange('ownerType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ownerTypes.map(type => (
                  <SelectItem key={type} value={type || ''}>
                    {type === 'PERSONA NATURAL' ? 'Persona Natural' : 
                     type === 'PERSONA JURIDICA' ? 'Persona Jurídica' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Año</Label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={(year || 0).toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Copropiedad</Label>
            <Select value={filters.copropiedad} onValueChange={(value) => handleFilterChange('copropiedad', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {copropiedades.map(copropiedad => (
                  <SelectItem key={copropiedad} value={copropiedad || ''}>
                    {copropiedad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Información de Contacto</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEmail"
                  checked={filters.hasEmail}
                  onCheckedChange={(checked) => handleFilterChange('hasEmail', checked)}
                />
                <Label htmlFor="hasEmail" className="text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Con Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPhone"
                  checked={filters.hasPhone}
                  onCheckedChange={(checked) => handleFilterChange('hasPhone', checked)}
                />
                <Label htmlFor="hasPhone" className="text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Con Teléfono
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {isExpanded && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Filtros Avanzados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minArea">Área Mínima (m²)</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="0"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxArea">Área Máxima (m²)</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="Sin límite"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minAvaluo">Avalúo Mínimo</Label>
                <Input
                  id="minAvaluo"
                  type="number"
                  placeholder="0"
                  value={filters.minAvaluo}
                  onChange={(e) => handleFilterChange('minAvaluo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAvaluo">Avalúo Máximo</Label>
                <Input
                  id="maxAvaluo"
                  type="number"
                  placeholder="Sin límite"
                  value={filters.maxAvaluo}
                  onChange={(e) => handleFilterChange('maxAvaluo', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumen de Filtros Activos */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="secondary">Búsqueda: "{filters.searchTerm}"</Badge>
              )}
              {filters.ownerType !== 'all' && (
                <Badge variant="secondary">Tipo: {filters.ownerType}</Badge>
              )}
              {filters.year !== 'all' && (
                <Badge variant="secondary">Año: {filters.year}</Badge>
              )}
              {filters.copropiedad !== 'all' && (
                <Badge variant="secondary">Copropiedad: {filters.copropiedad}</Badge>
              )}
              {filters.hasEmail && (
                <Badge variant="secondary">Con Email</Badge>
              )}
              {filters.hasPhone && (
                <Badge variant="secondary">Con Teléfono</Badge>
              )}
              {filters.minArea && (
                <Badge variant="secondary">Área ≥ {filters.minArea} m²</Badge>
              )}
              {filters.maxArea && (
                <Badge variant="secondary">Área ≤ {filters.maxArea} m²</Badge>
              )}
              {filters.minAvaluo && (
                <Badge variant="secondary">Avalúo ≥ ${filters.minAvaluo}</Badge>
              )}
              {filters.maxAvaluo && (
                <Badge variant="secondary">Avalúo ≤ ${filters.maxAvaluo}</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
