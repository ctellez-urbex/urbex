"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';
import { sessionService } from '@/lib/auth/session';
import { Input } from '@/components/ui/input';


export const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.signIn({
        email: formData.email,
        password: formData.password
      });

      if (result.success && result.token) {
        sessionService.setToken(result.token);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User is not confirmed')) {
          setError('Por favor, verifica tu correo electrónico antes de iniciar sesión');
        } else if (err.message.includes('Incorrect username or password')) {
          setError('Correo electrónico o contraseña incorrectos');
        } else {
          setError('Error al iniciar sesión. Por favor, intenta de nuevo');
        }
      } else {
        setError('Error al iniciar sesión. Por favor, intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </div>

      <div className="text-sm text-center">
        <a href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
}; 