"use client";

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

const RegisterForm = memo(() => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [loading, setLoading] = useState(false);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número de teléfono válido';
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // If it starts with +52 (Mexico), format accordingly
    if (cleaned.startsWith('+52')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 10) {
        return `+52 ${digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim()}`;
      }
    }
    
    return cleaned;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  }, [formatPhoneNumber, errors.phone]);

  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    if (message.includes('user already exists')) {
      return 'Ya existe una cuenta con este correo electrónico';
    }
    if (message.includes('invalid password')) {
      return 'La contraseña no cumple con los requisitos de seguridad';
    }
    if (message.includes('invalid phone number')) {
      return 'El número de teléfono no es válido';
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
      const result = await authService.signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.replace(/\s/g, '') // Remove spaces for AWS Cognito
      });

      if (result.success) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
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

  const isFormValid = formData.name && formData.email && formData.phone && 
                     formData.password && formData.confirmPassword && 
                     Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nombre completo *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleInputChange('name')}
            disabled={loading}
            error={errors.name}
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
            placeholder="+52 123 456 7890"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={loading}
            error={errors.phone}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Incluye el código de país (ej: +52 para México)
          </p>
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
        disabled={loading || !isFormValid}
        loading={loading}
        className="w-full"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <div className="text-sm text-center space-y-2">
        <div>
          <span className="text-gray-600 dark:text-gray-400">¿Ya tienes una cuenta? </span>
          <Link 
            href="/auth/login" 
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