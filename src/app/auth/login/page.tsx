'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthRoute } from '@/components/auth/AuthRoute';

function LoginContent() {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Bienvenido de nuevo
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Inicia sesión para acceder a tu cuenta
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg">
        <LoginForm />
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Al iniciar sesión, aceptas nuestros{' '}
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
  );
}

export default function LoginPage() {
  return (
    <AuthRoute>
      <Suspense fallback={
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
            <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </AuthRoute>
  );
} 