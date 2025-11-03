/**
 * Property Type Selector Component
 * 
 * Reusable component for selecting property types
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PropertyTypeOption {
  value: string;
  label: string;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'bodegas', label: 'Bodegas' },
  { value: 'cementerios', label: 'Cementerios' },
  { value: 'clubles', label: 'Clubes' },
  { value: 'clinicas, hospitales y centros medicos', label: 'Clínicas, hospitales y centros médicos' },
  { value: 'colegios y universidades', label: 'Colegios y universidades' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'culto religioso', label: 'Culto religioso' },
  { value: 'depositos', label: 'Depósitos' },
  { value: 'estaciones de servicio', label: 'Estaciones de servicio' },
  { value: 'hoteles', label: 'Hoteles' },
  { value: 'industria', label: 'Industria' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'oficinas', label: 'Oficinas' },
  { value: 'otros', label: 'Otros' },
  { value: 'parqueadero', label: 'Parqueadero' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'teatros y cinemas', label: 'Teatros y cines' }
];

interface PropertyTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function PropertyTypeSelector({ value, onChange, disabled = false }: PropertyTypeSelectorProps) {
  const handleSelectionChange = (selectedValue: string) => {
    if (selectedValue === 'Todos') {
      onChange(['Todos']);
    } else {
      const newValue = value.includes(selectedValue)
        ? value.filter(v => v !== selectedValue)
        : [...value.filter(v => v !== 'Todos'), selectedValue];
      
      if (newValue.length === 0) {
        onChange(['Todos']);
      } else {
        onChange(newValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tipo de inmueble(s)
      </label>
      <Select value={value.includes('Todos') ? 'Todos' : value[0] || ''} onValueChange={handleSelectionChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona el tipo de inmueble" />
        </SelectTrigger>
        <SelectContent>
          {PROPERTY_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.length > 1 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.filter(v => v !== 'Todos').map((type) => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {PROPERTY_TYPES.find(t => t.value === type)?.label}
              <button
                type="button"
                onClick={() => handleSelectionChange(type)}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
