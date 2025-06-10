"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';
import { Input } from '@/components/ui/input';

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(formData.email);
      setStep('code');
      setMessage('Se ha enviado un código de verificación a tu correo electrónico.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      });

      setMessage('Contraseña actualizada correctamente');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestCode} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Correo electrónico
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
            type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={error}
          />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="space-y-4">
      <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Código de verificación
        </label>
          <div className="mt-1">
            <Input
              id="code"
              name="code"
          type="text"
              required
              placeholder="123456"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        />
          </div>
      </div>

      <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nueva contraseña
        </label>
          <div className="mt-1">
            <Input
              id="newPassword"
              name="newPassword"
          type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        />
          </div>
      </div>

      <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirmar contraseña
        </label>
          <div className="mt-1">
            <Input
              id="confirmPassword"
              name="confirmPassword"
          type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={error}
        />
          </div>
        </div>
      </div>

      {message && (
        <div className="text-sm text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </div>
    </form>
  );
}; 