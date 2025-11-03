/**
 * Year Range Input Component
 * 
 * Reusable component for year range inputs (construction years)
 */

import { Input } from '@/components/ui/input';

interface YearRangeInputProps {
  label: string;
  minValue: number | '';
  maxValue: number | '';
  onMinChange: (value: number | '') => void;
  onMaxChange: (value: number | '') => void;
  disabled?: boolean;
}

export function YearRangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled = false
}: YearRangeInputProps) {
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear + 10; // Allow future years for planned construction

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMinChange(value === '' ? '' : Math.max(minYear, Math.min(maxYear, parseInt(value) || minYear)));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMaxChange(value === '' ? '' : Math.max(minYear, Math.min(maxYear, parseInt(value) || maxYear)));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            type="number"
            value={minValue}
            onChange={handleMinChange}
            placeholder="Desde (YYYY)"
            min={minYear}
            max={maxYear}
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="number"
            value={maxValue}
            onChange={handleMaxChange}
            placeholder="Hasta (YYYY)"
            min={minYear}
            max={maxYear}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
