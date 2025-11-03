/**
 * Chip Input Component
 * 
 * Chip input with validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChipInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ChipInput({ 
  value, 
  onChange, 
  placeholder = "Ej: 1234567890",
  disabled = false,
  required = false
}: ChipInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="chip">
        Chip {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="chip"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full"
      />
    </div>
  );
}
