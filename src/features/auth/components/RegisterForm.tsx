"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/config/api-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  plan: string;
}

const planOptions = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'semanal', label: 'Semanal' }
];

const RegisterForm = memo(() => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    plan: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [loading, setLoading] = useState(false);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else {
      // Remove spaces and validate format
      const cleanPhone = formData.phone.replace(/\s/g, '');
      
      // Validate Colombia phone numbers (+57 followed by 10 digits)
      if (cleanPhone.startsWith('+57')) {
        const digits = cleanPhone.slice(3);
        if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
          newErrors.phone = 'El número de teléfono debe tener 10 dígitos después del código de país (+57)';
        }
      }
      // Validate Mexico phone numbers (+52 followed by 10 digits)
      else if (cleanPhone.startsWith('+52')) {
        const digits = cleanPhone.slice(3);
        if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
          newErrors.phone = 'El número de teléfono debe tener 10 dígitos después del código de país (+52)';
        }
      }
      // Validate other international formats
      else if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
        newErrors.phone = 'Ingresa un número de teléfono válido con código de país (ej: +57 317 890 1234)';
      }
    }

    if (!formData.plan) {
      newErrors.plan = 'Debes seleccionar un plan';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof RegisterFormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === 'email' ? e.target.value.toLowerCase().trim() : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }, [errors]);

  const formatPhoneNumber = useCallback((value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +57 (Colombia), format accordingly
    if (cleaned.startsWith('+57')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 10) {
        return `+57 ${digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim()}`;
      }
    }
    
    // If it starts with +52 (Mexico), format accordingly
    if (cleaned.startsWith('+52')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 10) {
        return `+52 ${digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim()}`;
      }
    }
    
    // For other countries, just return the cleaned value
    return cleaned;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  }, [formatPhoneNumber, errors.phone]);

  const formatPhoneForCognito = useCallback((phone: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  }, []);

  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    if (message.includes('user already exists') || message.includes('already exists')) {
      return 'Ya existe una cuenta con este correo electrónico';
    }
    if (message.includes('invalid password')) {
      return 'La contraseña no cumple con los requisitos de seguridad';
    }
    if (message.includes('invalid phone number')) {
      return 'El número de teléfono no es válido';
    }
    if (message.includes('email') && message.includes('required')) {
      return 'El correo electrónico es requerido';
    }
    if (message.includes('password') && message.includes('required')) {
      return 'La contraseña es requerida';
    }
    return 'Error al crear la cuenta. Por favor, intenta de nuevo';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Registering user:', formData.email);
      const result = await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formatPhoneForCognito(formData.phone),
        plan: formData.plan,
        su: '1' // Default value for new users
      });
      console.log('🔵 Register result:', result);

      if (result.success) {
        router.push(`/auth/verify-email/index.html?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ email: result.error || 'Error al crear la cuenta' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ 
        email: err instanceof Error ? getErrorMessage(err) : 'Error al crear la cuenta' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, router]);

  const isFormValid = useCallback(() => {
    // Check if all required fields have values
    const hasAllFields = formData.firstName.trim() && 
                        formData.lastName.trim() && 
                        formData.email.trim() && 
                        formData.phone.trim() && 
                        formData.plan && 
                        formData.password && 
                        formData.confirmPassword;
    
    // Check if passwords match
    const passwordsMatch = formData.password === formData.confirmPassword;
    
    // Check if there are no validation errors
    const hasNoErrors = Object.keys(errors).length === 0;
    
    return hasAllFields && hasNoErrors && passwordsMatch;
  }, [formData, errors]);

  // Auto-clear confirmPassword error when passwords match
  useEffect(() => {
    if (formData.password && formData.confirmPassword && 
        formData.password === formData.confirmPassword && 
        errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [formData.password, formData.confirmPassword, errors.confirmPassword]);

  // Auto-clear email error when format is corrected
  useEffect(() => {
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [formData.email, errors.email]);

  // Auto-clear phone error when format is corrected
  useEffect(() => {
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\s/g, '');
      let isValid = false;
      
      if (cleanPhone.startsWith('+57')) {
        const digits = cleanPhone.slice(3);
        isValid = digits.length === 10 && /^\d{10}$/.test(digits);
      } else if (cleanPhone.startsWith('+52')) {
        const digits = cleanPhone.slice(3);
        isValid = digits.length === 10 && /^\d{10}$/.test(digits);
      } else {
        isValid = /^\+[1-9]\d{1,14}$/.test(cleanPhone);
      }
      
      if (isValid && errors.phone) {
        setErrors(prev => ({ ...prev, phone: undefined }));
      }
    }
  }, [formData.phone, errors.phone]);

  // Auto-clear firstName error when corrected
  useEffect(() => {
    if (formData.firstName.trim() && formData.firstName.trim().length >= 2 && errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: undefined }));
    }
  }, [formData.firstName, errors.firstName]);

  // Auto-clear lastName error when corrected
  useEffect(() => {
    if (formData.lastName.trim() && formData.lastName.trim().length >= 2 && errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: undefined }));
    }
  }, [formData.lastName, errors.lastName]);

  // Auto-clear password error when requirements are met
  useEffect(() => {
    if (formData.password && 
        formData.password.length >= 8 && 
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) && 
        errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [formData.password, errors.password]);

  // Auto-clear plan error when selected
  useEffect(() => {
    if (formData.plan && errors.plan) {
      setErrors(prev => ({ ...prev, plan: undefined }));
    }
  }, [formData.plan, errors.plan]);

  // Auto-clear all errors when form becomes valid
  useEffect(() => {
    const hasAllFields = formData.firstName.trim() && 
                        formData.lastName.trim() && 
                        formData.email.trim() && 
                        formData.phone.trim() && 
                        formData.plan && 
                        formData.password && 
                        formData.confirmPassword;
    
    const passwordsMatch = formData.password === formData.confirmPassword;
    
    if (hasAllFields && passwordsMatch && Object.keys(errors).length > 0) {
      // Only clear errors if all fields are filled and passwords match
      setErrors({});
    }
  }, [formData, errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        {/* First Name Field */}
        <div>
          <label 
            htmlFor="firstName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nombre *
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="Tu nombre"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            disabled={loading}
            error={errors.firstName}
            className="w-full"
          />
        </div>

        {/* Last Name Field */}
        <div>
          <label 
            htmlFor="lastName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Apellido *
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            placeholder="Tu apellido"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            disabled={loading}
            error={errors.lastName}
            className="w-full"
          />
        </div>

        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Correo electrónico *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={loading}
            error={errors.email}
            className="w-full"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label 
            htmlFor="phone" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Teléfono *
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+57 317 890 1234"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={loading}
            error={errors.phone}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Incluye el código de país (ej: +57 para Colombia)
          </p>
        </div>

        {/* Plan Field */}
        <div>
          <label 
            htmlFor="plan" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Plan *
          </label>
          <Select 
            value={formData.plan} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
            disabled={loading}
            required
          >
            <SelectTrigger className={`w-full ${errors.plan ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent>
              {planOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.plan && (
            <p className="text-red-500 text-sm mt-1">{errors.plan}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Contraseña *
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={loading}
            error={errors.password}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirmar contraseña *
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={loading}
            error={errors.confirmPassword}
            className="w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary-blue"
        disabled={loading || !isFormValid()}
        loading={loading}
        className="w-full"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <div className="text-sm text-center space-y-2">
        <div>
          <span className="text-gray-600 dark:text-gray-400">¿Ya tienes una cuenta? </span>
          <Link 
            href="/auth/login/index.html" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Al crear una cuenta, aceptas nuestros{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              términos de servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              política de privacidad
            </a>
          </p>
        </div>
      </div>
    </form>
  );
});

RegisterForm.displayName = 'RegisterForm';

export { RegisterForm }; 