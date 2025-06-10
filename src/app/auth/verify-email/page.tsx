import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';
import { Suspense } from 'react';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Email - Urbex',
  description: 'Verifica tu correo electrónico para completar el registro en Urbex',
};

function VerifyEmailContent() {
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
            Verificar correo electrónico
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa el código de verificación que enviamos a tu correo electrónico
          </p>
        </div>
        <div className="mt-8 bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 