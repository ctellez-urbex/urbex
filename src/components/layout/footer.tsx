'use client';

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <footer className={`border-t ${
      theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={theme === 'dark' ? "/images/urbex-white.svg" : "/images/urbex-logo.svg"}
                alt="Urbex Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <p className={`mt-4 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}>
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#services" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="#about" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  Ideal
                </Link>
              </li>
              <li>
                <Link href="#clients" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  Clientes
                </Link>
              </li>
              <li>
                <Link href="#team" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  Equipo
                </Link>
              </li>
              <li>
                <Link href="#contact" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}>
              Contacto
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:alejandro@urbex.com.co" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  alejandro@urbex.com
                </a>
              </li>
              <li>
                <a href="tel:+573108780049" className={`text-sm hover:underline ${
                  theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}>
                  +57 310 878 0049
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-12 pt-8 border-t ${
          theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
        }`}>
          <p className={`text-sm text-center ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            © {currentYear} Urbex. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
} 