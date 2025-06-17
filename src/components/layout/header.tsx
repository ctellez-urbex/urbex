"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, User, LogOut } from "lucide-react";

// Definición de enlaces de navegación
const navLinks = [
  { href: "#hero", label: "Explorar" },
  { href: "#services", label: "Servicios" },
  { href: "#about", label: "Ideal" },
  { href: "#clients", label: "Clientes" },
  { href: "#team", label: "Equipo" },
  { href: "#contact", label: "Contacto" },
];

export default function Header() {
  const { theme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  // Efecto para detectar el scroll y actualizar el estado
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detectar sección activa basada en la posición de scroll
      const sections = navLinks.map(link => link.href.replace('#', ''));
      
      // Encontrar qué sección está actualmente visible
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      } else if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Establecer estado inicial
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar el menú móvil cuando cambia el tamaño de la ventana a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Función para verificar si un enlace está activo
  const isActive = (href: string) => {
    return activeSection === href.replace('#', '');
  };

  // Función para manejar el scroll suave a las secciones
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      // Cerrar el menú móvil si está abierto
      setIsMenuOpen(false);
      
      // Scroll suave a la sección
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Actualizar la URL sin recargar la página
      window.history.pushState(null, '', href);
      
      // Actualizar la sección activa
      setActiveSection(targetId);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo con animación al hover */}
        <Link href="/" className="flex items-center group">
          <div className="relative w-auto mr-2 transition-transform group-hover:scale-105 duration-300">
            {mounted ? (
              <Image 
                src={(theme === "dark" || resolvedTheme === "dark") ? "/images/urbex-white.svg" : "/images/urbex-logo.svg"} 
                alt="Urbex Logo" 
                width={100}
                height={22}
                className="w-auto h-8" 
              />
            ) : (
              <Image 
                src="/images/urbex-logo.svg" 
                alt="Urbex Logo" 
                width={100}
                height={22}
                className="w-auto h-8" 
              />
            )}
          </div>
        </Link>

        {/* Desktop Navigation con indicador de sección activa */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className={`relative py-2 font-medium transition-all duration-300 cursor-pointer ${
                isActive(link.href) 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 rounded-full transform transition-transform duration-300"></span>
              )}
            </a>
          ))}
          
          <div className="h-5 w-px bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
          
          <Link
            href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </Link>
          
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button con animación */}
        <div className="flex items-center space-x-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`text-neutral-700 dark:text-neutral-300 p-2 rounded-full transition-all duration-300 ${isMenuOpen ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <div className="w-6 h-6 relative">
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "rotate-45 top-3" : "rotate-0 top-1"}`}
              />
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 top-3 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
              />
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 top-3" : "rotate-0 top-5"}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation con animación de entrada/salida */}
      <div 
        className={`fixed top-[72px] left-0 right-0 md:hidden bg-white dark:bg-neutral-900 shadow-lg border-t border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-300 ${
          isMenuOpen 
            ? "max-h-96 opacity-100" 
            : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-4 flex flex-col space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isActive(link.href) 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" 
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              {link.label}
            </a>
          ))}
          
          <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 my-2"></div>
          
          <Link
            href="/auth/login/index.html"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 mt-2 text-center font-medium rounded-md shadow-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
