import { RegisterForm } from '@/features/auth/components/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/urbex-logo.svg"
            alt="Urbex Logo"
            width={150}
            height={40}
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Inicia sesión
            </a>
          </p>
        </div>
        <div className="mt-8 bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 