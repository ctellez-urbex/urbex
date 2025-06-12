'use client';

import { memo } from "react";
import { AuthFooter } from '@/components/layout/auth-footer';
import { AuthHeader } from '@/components/layout/auth-header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        {children}
      </main>
      <AuthFooter />
    </div>
  );
}

export default memo(AuthLayout); 