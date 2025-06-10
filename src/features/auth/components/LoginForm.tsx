"use client";

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';
import { sessionService } from '@/lib/auth/session';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = memo(() => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (error) setError(''); // Clear error when user starts typing
    }, [error]);

  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    if (message.includes('user is not confirmed')) {
      return 'Por favor, verifica tu correo electrónico antes de iniciar sesión';
    }
    if (message.includes('incorrect username or password')) {
      return 'Correo electrónico o contraseña incorrectos';
    }
    if (message.includes('user does not exist')) {
      return 'No existe una cuenta con este correo electrónico';
    }
    return 'Error al iniciar sesión. Por favor, intenta de nuevo';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.signIn({
        email: formData.email.trim(),
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
      setError(err instanceof Error ? getErrorMessage(err) : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
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
            className="w-full"
          />
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={loading}
            className="w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !formData.email || !formData.password}
        className="w-full"
        loading={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <div className="text-sm text-center space-y-2">
        <Link 
          href="/auth/forgot-password" 
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <div>
          <span className="text-gray-600 dark:text-gray-400">¿No tienes una cuenta? </span>
          <Link 
            href="/auth/register" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Regístrate
          </Link>
        </div>
      </div>
    </form>
  );
});

LoginForm.displayName = 'LoginForm';

export { LoginForm }; 