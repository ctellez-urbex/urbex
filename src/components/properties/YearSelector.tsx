/**
 * Year Selector Component
 * 
 * Easy-to-use year selector with dropdown
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface YearSelectorProps {
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

export function YearSelector({ 
  value, 
  onChange, 
  placeholder = "Seleccionar año",
  disabled = false,
  minYear = 1900,
  maxYear = new Date().getFullYear()
}: YearSelectorProps) {
  // Generate years array
  const years = Array.from(
    { length: maxYear - minYear + 1 }, 
    (_, i) => maxYear - i
  );

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onChange('');
    } else {
      onChange(parseInt(selectedValue));
    }
  };

  return (
    <Select
      value={value === '' ? 'none' : value.toString()}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin especificar</SelectItem>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
