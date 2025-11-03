/**
 * Address Input Component
 * 
 * Address input with validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Ej: Calle 123 #45-67",
  disabled = false,
  required = false
}: AddressInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        Dirección {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="address"
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
