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
    <footer className={`border-t ${
      theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
    }`}>
          <p className={`text-sm text-center ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            © {currentYear} Urbex. Todos los derechos reservados.
          </p>
    </footer>
  );
} 