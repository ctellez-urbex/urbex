'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './client-layout';

export default function RouteHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
} 