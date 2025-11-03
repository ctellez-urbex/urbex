/**
 * City Selector Component
 * 
 * City selector with Bogotá D.C. as default
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CitySelector({ value, onChange, disabled = false }: CitySelectorProps) {
  const cities = [
    { value: 'bogota', label: 'Bogotá D.C.' },
  ];

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccionar ciudad" />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city.value} value={city.value}>
            {city.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
