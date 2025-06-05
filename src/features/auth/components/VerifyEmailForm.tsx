"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';

export const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.confirmSignUp(email, formData.code);
      setMessage('Correo electrónico verificado correctamente');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.resendConfirmationCode(email);
      setMessage('Código de verificación reenviado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verificar correo electrónico
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ingresa el código de verificación enviado a {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Código de verificación
          </label>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ code: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-600 dark:text-green-400">
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading}
          className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          ¿No recibiste el código? Reenviar
        </button>
      </div>
    </div>
  );
}; 