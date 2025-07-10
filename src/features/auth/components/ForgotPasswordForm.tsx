"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { forgotPassword, resetPassword } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordFormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPasswordForm = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check URL parameters on component mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const stepParam = searchParams.get('step');
    
    if (emailParam && stepParam === 'code') {
      setFormData(prev => ({ ...prev, email: emailParam }));
      setStep('code');
      setMessage('Ingresa el código de verificación que recibiste por email.');
    }
  }, [searchParams]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresa un correo electrónico válido';
    }
    return undefined;
  }, []);

  const validatePasswordForm = useCallback((): Partial<ForgotPasswordFormData> => {
    const newErrors: Partial<ForgotPasswordFormData> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código de verificación es requerido';
    } else if (!/^\d{6}$/.test(formData.code.trim())) {
      newErrors.code = 'El código debe tener 6 dígitos';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof ForgotPasswordFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'email' ? e.target.value.toLowerCase().trim() : 
                   field === 'code' ? e.target.value.replace(/\D/g, '').slice(0, 6) : 
                   e.target.value;
      
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
      
      // Clear general message when user makes changes
      if (message) {
        setMessage('');
      }
    }, [errors, message]);

  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    if (message.includes('user does not exist') || message.includes('user not found')) {
      return 'No existe una cuenta con este correo electrónico';
    }
    if (message.includes('invalid verification code') || message.includes('code mismatch')) {
      return 'Código de verificación inválido o expirado';
    }
    if (message.includes('attempt limit exceeded')) {
      return 'Demasiados intentos. Espera antes de intentar de nuevo';
    }
    if (message.includes('expired')) {
      return 'El código ha expirado. Solicita uno nuevo';
    }
    return 'Error en el proceso. Por favor, intenta de nuevo';
  };

  const handleRequestCode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔵 Requesting password reset code for:', formData.email);
      // For forgot password, we don't need a token as it's a public endpoint
      const result = await forgotPassword({ email: formData.email });
      console.log('🔵 Forgot password result:', result);
      
      if (result.success) {
        setStep('code');
        setMessage('Se ha enviado un código de verificación a tu correo electrónico. Revisa también tu carpeta de spam.');
        setResendCooldown(60); // 60 second cooldown
      } else {
        // Show the specific error message from the API
        setErrors({ email: result.error || 'Error al solicitar el código' });
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      setErrors({ 
        email: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData.email, validateEmail]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      console.log('🔵 Resending password reset code for:', formData.email);
      // For resend code, we don't need a token as it's a public endpoint
      const result = await forgotPassword({ email: formData.email });
      console.log('🔵 Resend code result:', result);
      
      if (result.success) {
        setMessage('Código reenviado correctamente');
        setResendCooldown(60);
      } else {
        setErrors({ code: result.error || 'Error al reenviar el código' });
      }
    } catch (err) {
      console.error('❌ Resend code error:', err);
      setErrors({ 
        code: err instanceof Error ? getErrorMessage(err) : 'Error al reenviar el código' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData.email, resendCooldown]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔵 Resetting password for:', formData.email);
      // For reset password, we need the user's token for authorization
      const result = await resetPassword({
        username: formData.email,
        confirmation_code: formData.code.trim(),
        new_password: formData.newPassword
      }, user?.token);
      console.log('🔵 Reset password result:', result);

      if (result.success) {
        setMessage('¡Contraseña actualizada correctamente! Redirigiendo...');
        setTimeout(() => {
          router.push('/auth/login/index.html?message=password-reset-success');
        }, 2000);
      } else {
        setErrors({ code: result.error || 'Error al restablecer la contraseña' });
      }
    } catch (err) {
      console.error('❌ Reset password error:', err);
      setErrors({ 
        code: err instanceof Error ? getErrorMessage(err) : 'Error al restablecer la contraseña' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, validatePasswordForm, router]);

  // Email step form
  if (step === 'email') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Correo electrónico
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

          <Button
            type="submit"
            variant="primary-blue"
            disabled={loading || !formData.email}
            loading={loading}
            className="w-full"
          >
            {loading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link 
            href="/auth/login/index.html" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // Password reset step form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verificar código
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa el código de 6 dígitos enviado a <strong>{formData.email}</strong>
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 text-center">
            {message}
          </p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
        <div>
          <label 
            htmlFor="code" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Código de verificación
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="123456"
            value={formData.code}
            onChange={handleInputChange('code')}
            disabled={loading}
            error={errors.code}
            className="w-full text-center text-2xl tracking-widest"
            maxLength={6}
          />
          <div className="mt-2 flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              ¿No recibiste el código?
            </span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
            </button>
          </div>
        </div>

        <div>
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nueva contraseña
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            disabled={loading}
            error={errors.newPassword}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
          </p>
        </div>

        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirmar nueva contraseña
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

        <Button
          type="submit"
          variant="primary-blue"
          disabled={loading || !formData.code || !formData.newPassword || !formData.confirmPassword}
          loading={loading}
          className="w-full"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={() => setStep('email')}
            disabled={loading}
            className="text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
          >
            ← Cambiar correo
          </button>
          <Link 
            href="/auth/login/index.html" 
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
});

ForgotPasswordForm.displayName = 'ForgotPasswordForm';

export { ForgotPasswordForm }; 