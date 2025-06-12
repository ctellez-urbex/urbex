import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthRoute } from '@/components/auth/AuthRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrarse',
  description: 'Crea tu cuenta en Urbex para acceder a información inmobiliaria exclusiva',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthRoute>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Únete a Urbex y descubre el futuro inmobiliario
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg">
          <RegisterForm />
        </div>
      </div>
    </AuthRoute>
  );
} 