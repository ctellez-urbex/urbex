'use client';

import { memo, Suspense } from "react";
import { AuthFooter } from '@/components/layout/auth-footer';
import { AuthHeader } from '@/components/layout/auth-header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Suspense fallback={
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </header>
      }>
        <AuthHeader />
      </Suspense>
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        {children}
      </main>
      <AuthFooter />
    </div>
  );
}

export default memo(AuthLayout); 