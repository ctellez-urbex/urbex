/**
 * Property Search Form Component
 * 
 * Main search form component that combines all search filters
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchTypeSelector } from './SearchTypeSelector';
import { PropertyTypeSelector } from './PropertyTypeSelector';
import { NumberRangeInput } from './NumberRangeInput';
import { YearSelector } from './YearSelector';
import { CitySelector } from './CitySelector';
import { AddressInput } from './AddressInput';
import { ChipInput } from './ChipInput';
import { MatriculaInput } from './MatriculaInput';
import { CopropiedadInput } from './CopropiedadInput';
import { Search, MapPin, Building, Calendar, Layers, Map, Home, Hash, FileText, Building2 } from 'lucide-react';

export interface PropertySearchFilters {
  searchType: string;
  propertyTypes: string[];
  areaMin: number | '';
  areaMax: number | '';
  stratumMin: number | '';
  stratumMax: number | '';
  constructionYearMin: number | '';
  constructionYearMax: number | '';
  city: string;
  address: string;
  chip: string;
  matricula: string;
  copropiedad: string;
  polygon?: string;
}

interface PropertySearchFormProps {
  onSearch: (filters: PropertySearchFilters) => void;
  onFiltersChange?: (filters: PropertySearchFilters) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PropertySearchForm({ onSearch, onFiltersChange, loading = false, disabled = false }: PropertySearchFormProps) {
  const [filters, setFilters] = useState<PropertySearchFilters>({
    searchType: 'polygon',
    propertyTypes: ['Todos'],
    areaMin: 0,
    areaMax: 0,
    stratumMin: 0,
    stratumMax: 0,
    constructionYearMin: '',
    constructionYearMax: '',
    city: 'bogota',
    address: '',
    chip: '',
    matricula: '',
    copropiedad: ''
  });

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleSearchTypeChange = (searchType: string) => {
    setFilters(prev => ({ ...prev, searchType }));
  };

  const handlePropertyTypesChange = (propertyTypes: string[]) => {
    setFilters(prev => ({ ...prev, propertyTypes }));
  };

  const handleAreaMinChange = (areaMin: number | '') => {
    setFilters(prev => ({ ...prev, areaMin }));
  };

  const handleAreaMaxChange = (areaMax: number | '') => {
    setFilters(prev => ({ ...prev, areaMax }));
  };

  const handleStratumMinChange = (stratumMin: number | '') => {
    setFilters(prev => ({ ...prev, stratumMin }));
  };

  const handleStratumMaxChange = (stratumMax: number | '') => {
    setFilters(prev => ({ ...prev, stratumMax }));
  };

  const handleConstructionYearMinChange = (constructionYearMin: number | '') => {
    setFilters(prev => ({ ...prev, constructionYearMin }));
  };

  const handleConstructionYearMaxChange = (constructionYearMax: number | '') => {
    setFilters(prev => ({ ...prev, constructionYearMax }));
  };

  const handleCityChange = (city: string) => {
    setFilters(prev => ({ ...prev, city }));
  };

  const handleAddressChange = (address: string) => {
    setFilters(prev => ({ ...prev, address }));
  };

  const handleChipChange = (chip: string) => {
    setFilters(prev => ({ ...prev, chip }));
  };

  const handleMatriculaChange = (matricula: string) => {
    setFilters(prev => ({ ...prev, matricula }));
  };

  const handleCopropiedadChange = (copropiedad: string) => {
    setFilters(prev => ({ ...prev, copropiedad }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const isFormValid = () => {
    switch (filters.searchType) {
      case 'polygon':
        return filters.searchType && filters.propertyTypes.length > 0;
      case 'address':
        return filters.searchType && filters.city && filters.address.trim() !== '';
      case 'chip':
        return filters.searchType && filters.city && filters.chip.trim() !== '';
      case 'matricula':
        return filters.searchType && filters.city && filters.matricula.trim() !== '';
      case 'copropiedad':
        return filters.searchType && filters.city && filters.copropiedad.trim() !== '' && filters.address.trim() !== '';
      default:
        return false;
    }
  };

  const getButtonText = () => {
    switch (filters.searchType) {
      case 'polygon':
        return 'Buscar';
      case 'address':
        return 'Buscar Dirección';
      case 'chip':
        return 'Buscar Chip';
      case 'matricula':
        return 'Buscar Matrícula';
      case 'copropiedad':
        return 'Buscar Copropiedad';
      default:
        return 'Buscar';
    }
  };

  const getButtonIcon = () => {
    switch (filters.searchType) {
      case 'polygon':
        return <Map className="w-4 h-4 mr-2" />;
      case 'address':
        return <MapPin className="w-4 h-4 mr-2" />;
      case 'chip':
        return <Hash className="w-4 h-4 mr-2" />;
      case 'matricula':
        return <FileText className="w-4 h-4 mr-2" />;
      case 'copropiedad':
        return <Building2 className="w-4 h-4 mr-2" />;
      default:
        return <Search className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Búsqueda de Propiedades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Type and Property Type - Always visible in one column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SearchTypeSelector
                value={filters.searchType}
                onChange={handleSearchTypeChange}
                disabled={disabled}
              />
            </div>
            
            {/* Property Type - Only show for polygon search */}
            {filters.searchType === 'polygon' && (
              <div className="space-y-2">
                <PropertyTypeSelector
                  value={filters.propertyTypes}
                  onChange={handlePropertyTypesChange}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Dynamic form based on search type */}
          {filters.searchType === 'polygon' && (
            <div className="space-y-4">

              <NumberRangeInput
                label="Área construida (m²)"
                minValue={filters.areaMin}
                maxValue={filters.areaMax}
                onMinChange={handleAreaMinChange}
                onMaxChange={handleAreaMaxChange}
                min={0}
                max={100000}
                disabled={disabled}
                placeholder={{ min: '0', max: '100000' }}
                showIndividualLabels={true}
                minLabel="Mínima"
                maxLabel="Máxima"
              />

              <NumberRangeInput
                label="Estrato"
                minValue={filters.stratumMin}
                maxValue={filters.stratumMax}
                onMinChange={handleStratumMinChange}
                onMaxChange={handleStratumMaxChange}
                min={0}
                max={6}
                disabled={disabled}
                placeholder={{ min: '0', max: '6' }}
                showIndividualLabels={true}
                minLabel="Mínimo"
                maxLabel="Máximo"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año de construcción desde</label>
                  <YearSelector
                    value={filters.constructionYearMin}
                    onChange={handleConstructionYearMinChange}
                    placeholder="Desde (YYYY)"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año de construcción hasta</label>
                  <YearSelector
                    value={filters.constructionYearMax}
                    onChange={handleConstructionYearMaxChange}
                    placeholder="Hasta (YYYY)"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}

          {filters.searchType === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <CitySelector
                    value={filters.city}
                    onChange={handleCityChange}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <AddressInput
                    value={filters.address}
                    onChange={handleAddressChange}
                    disabled={disabled}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {filters.searchType === 'chip' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <CitySelector
                    value={filters.city}
                    onChange={handleCityChange}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <ChipInput
                    value={filters.chip}
                    onChange={handleChipChange}
                    disabled={disabled}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {filters.searchType === 'matricula' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <CitySelector
                    value={filters.city}
                    onChange={handleCityChange}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <MatriculaInput
                    value={filters.matricula}
                    onChange={handleMatriculaChange}
                    disabled={disabled}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {filters.searchType === 'copropiedad' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <CitySelector
                    value={filters.city}
                    onChange={handleCityChange}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <CopropiedadInput
                    value={filters.copropiedad}
                    onChange={handleCopropiedadChange}
                    disabled={disabled}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <AddressInput
                  value={filters.address}
                  onChange={handleAddressChange}
                  disabled={disabled}
                  required
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isFormValid() || loading || disabled}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  {getButtonIcon()}
                  {getButtonText()}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
