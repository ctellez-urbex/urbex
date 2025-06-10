'use client';

import { memo } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-200">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default memo(ClientLayout); 