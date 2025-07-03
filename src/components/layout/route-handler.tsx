'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './client-layout';
import LandingLayout from './landing-layout';

export default function RouteHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Landing page gets the landing layout with header/footer
  const isLandingPage = pathname === '/';
  
  // Auth routes get clean layout
  const isAuthRoute = pathname.startsWith('/auth');
  
  // Dashboard routes get the client layout with sidebar
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Landing page gets the landing layout
  if (isLandingPage) {
    return <LandingLayout>{children}</LandingLayout>;
  }

  // Dashboard and admin routes get the client layout with sidebar
  if (isDashboardRoute) {
    return <ClientLayout>{children}</ClientLayout>;
  }

  // Auth routes get clean layout
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Default: clean layout for other routes
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <main className="flex-1">{children}</main>
    </div>
  );
} 