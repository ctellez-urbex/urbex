/**
 * Matrícula Input Component
 * 
 * Matrícula inmobiliaria input with validation
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MatriculaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function MatriculaInput({ 
  value, 
  onChange, 
  placeholder = "Ej: 008412016002",
  disabled = false,
  required = false
}: MatriculaInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="matricula">
        Matrícula Inmobiliaria {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="matricula"
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
