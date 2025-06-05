'use client';

import AuthLayout from './layout';

export default function NotFound() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Página no encontrada
        </p>
      </div>
    </AuthLayout>
  );
} 