import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrarse - Urbex',
  description: 'Crea tu cuenta en Urbex para acceder a información inmobiliaria exclusiva',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Únete a Urbex y descubre el futuro inmobiliario
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 py-6 sm:py-8 px-4 sm:px-6 shadow-sm sm:shadow-lg border border-neutral-200 dark:border-neutral-700 sm:rounded-lg">
          <RegisterForm />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Al crear una cuenta, aceptas nuestros{' '}
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