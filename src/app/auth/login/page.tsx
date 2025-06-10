import { LoginForm } from '@/features/auth/components/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Urbex',
  description: 'Inicia sesión en tu cuenta de Urbex para acceder a la información inmobiliaria',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
        <div className="bg-white dark:bg-neutral-800 py-6 sm:py-8 px-4 sm:px-6 shadow-sm sm:shadow-lg border border-neutral-200 dark:border-neutral-700 sm:rounded-lg">
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
    </div>
  );
} 