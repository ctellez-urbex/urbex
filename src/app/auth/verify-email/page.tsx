import { Suspense } from 'react';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Email - Urbex',
  description: 'Verifica tu correo electrónico para completar el registro en Urbex',
};

function VerifyEmailContent() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-neutral-800 py-6 sm:py-8 px-4 sm:px-6 shadow-sm sm:shadow-lg border border-neutral-200 dark:border-neutral-700 sm:rounded-lg">
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 