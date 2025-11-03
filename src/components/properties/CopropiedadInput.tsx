/**
 * Copropiedad Input Component
 * 
 * Copropiedad name input with validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CopropiedadInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CopropiedadInput({ 
  value, 
  onChange, 
  placeholder = "Ej: Conjunto Residencial Los Pinos",
  disabled = false,
  required = false
}: CopropiedadInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="copropiedad">
        Nombre de la Copropiedad {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="copropiedad"
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
