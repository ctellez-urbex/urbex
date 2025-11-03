/**
 * Search Type Selector Component
 * 
 * Reusable component for selecting search type
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SearchTypeOption {
  value: string;
  label: string;
}

const SEARCH_TYPES: SearchTypeOption[] = [
  { value: 'polygon', label: 'En un polígono' },
  { value: 'address', label: 'Por dirección' },
  { value: 'chip', label: 'Por chip' },
  { value: 'matricula', label: 'Por matrícula inmobiliaria' },
  { value: 'copropiedad', label: 'Nombre de la copropiedad' }
];

interface SearchTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SearchTypeSelector({ value, onChange, disabled = false }: SearchTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tipo de búsqueda
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona el tipo de búsqueda" />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
