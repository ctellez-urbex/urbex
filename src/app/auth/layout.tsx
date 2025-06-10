'use client';

import { memo } from "react";
import { AuthFooter } from '@/components/layout/auth-footer';
import { AuthHeader } from '@/components/layout/auth-header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <AuthHeader />
      <main className="flex-grow pt-16 pb-8">{children}</main>
      <AuthFooter />
    </div>
  );
}

export default memo(AuthLayout); 