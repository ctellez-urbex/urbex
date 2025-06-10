'use client';

import { useEffect, useState } from "react";
import { AuthFooter } from '@/components/layout/auth-footer';
import { AuthHeader } from '@/components/layout/auth-header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <AuthHeader />
      <main className="flex-grow pt-16">{children}</main>
      <AuthFooter />
    </div>
  );
} 