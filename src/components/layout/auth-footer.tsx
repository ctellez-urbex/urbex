'use client';

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function AuthFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return null;
  }

  return (
    <footer className={`border-t py-4 ${
      theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className={`text-sm text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          © {currentYear} Urbex. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
} 