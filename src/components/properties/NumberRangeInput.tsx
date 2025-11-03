/**
 * Number Range Input Component
 * 
 * Reusable component for min/max number inputs
 */

import { Input } from '@/components/ui/input';

interface NumberRangeInputProps {
  label: string;
  minValue: number | '';
  maxValue: number | '';
  onMinChange: (value: number | '') => void;
  onMaxChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: {
    min?: string;
    max?: string;
  };
  showIndividualLabels?: boolean;
  minLabel?: string;
  maxLabel?: string;
}

export function NumberRangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  min = 0,
  max = 999999,
  step = 1,
  disabled = false,
  placeholder = { min: 'Mínimo', max: 'Máximo' },
  showIndividualLabels = false,
  minLabel = 'Mínimo',
  maxLabel = 'Máximo'
}: NumberRangeInputProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onMinChange('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        onMinChange(Math.max(min, Math.min(max, numValue)));
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onMaxChange('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        onMaxChange(Math.max(min, Math.min(max, numValue)));
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          {showIndividualLabels && (
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {minLabel}
            </label>
          )}
          <Input
            type="number"
            value={minValue}
            onChange={handleMinChange}
            placeholder={placeholder.min}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          {showIndividualLabels && (
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {maxLabel}
            </label>
          )}
          <Input
            type="number"
            value={maxValue}
            onChange={handleMaxChange}
            placeholder={placeholder.max}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
