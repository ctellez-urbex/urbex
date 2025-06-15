"use client";

import { useState, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SimpleButton } from '@/components/ui/simple-button';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = memo(() => {
  const { signIn } = useAuth();
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



  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟡 Form submit triggered, loading:', loading)
    
    // Prevent multiple submissions
    if (loading) {
      console.log('🟡 Already loading, ignoring submit')
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      console.log('🟡 Calling signIn...')
      const result = await signIn(formData.email.trim(), formData.password);
      console.log('🟡 SignIn result:', result)
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
        setLoading(false); // Only set loading false if there's an error
      }
      // Don't set loading false here if success - let redirect happen
    } catch (err) {
      console.error('🔴 Login form error:', err);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo');
      setLoading(false);
    }
  }, [formData, signIn, loading]);

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
        variant="primary-blue"
        disabled={loading || !formData.email || !formData.password}
        className="w-full"
        loading={loading}
      >
        Iniciar sesión
      </Button>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary-blue"
          onClick={() => window.location.href = '/'}
          className="flex-1"
          disabled={loading}
        >
          Volver
        </Button>
      </div>

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