import { LoginForm } from '@/features/auth/components/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{' '}
            <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Regístrate
            </a>
          </p>
        </div>
        <div className="mt-8 bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 