"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/aws/cognito';
import { Input } from '@/components/ui/input';

export const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authService.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
      <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre completo
        </label>
          <div className="mt-1">
            <Input
              id="name"
              name="name"
          type="text"
              autoComplete="name"
              required
              placeholder="Tu nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
          </div>
      </div>

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
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Teléfono
          </label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
          required
              placeholder="+52 123 456 7890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              autoComplete="new-password"
              required
              placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </div>

      <div className="text-sm text-center">
        <span className="text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
        </span>
        <a href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          Iniciar sesión
        </a>
      </div>
    </form>
  );
}; 