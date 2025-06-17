'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './client-layout';

export default function RouteHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only show header/footer on landing page (/)
  const isLandingPage = pathname === '/';
  
  // Routes that should not have header/footer
  const isAuthRoute = pathname.startsWith('/auth/login/index.html');
  const isDashboardRoute = pathname.startsWith('/dashboard/index.html');

  // Only landing page gets the full layout with header/footer
  if (isLandingPage) {
    return <ClientLayout>{children}</ClientLayout>;
  }

  // All other routes (auth, dashboard, etc.) get clean layout
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <main className="flex-1">{children}</main>
    </div>
  );
} 