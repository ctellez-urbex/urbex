"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Hexagon, 
  Home, 
  TrendingUp, 
  Wand2, 
  Users, 
  Search,
  ChevronRight
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface ResponsiveMenuProps {
  items?: MenuItem[];
  className?: string;
  onItemClick?: (item: MenuItem) => void;
  activeItemId?: string;
}

const defaultItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Descripción General',
    icon: <Hexagon className="w-4 h-4" />,
    active: true
  },
  {
    id: 'unit-analysis',
    label: 'Análisis de unidad',
    icon: <Home className="w-4 h-4" />
  },
  {
    id: 'market-study',
    label: 'Estudio de mercado',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'lot-simulation',
    label: 'Simulación de desarrollo del lote',
    icon: <Wand2 className="w-4 h-4" />
  },
  {
    id: 'owners',
    label: 'Propietarios',
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'new-search',
    label: 'Nueva búsqueda',
    icon: <Search className="w-4 h-4" />
  }
];

export default function ResponsiveMenu({ 
  items = defaultItems, 
  className,
  onItemClick,
  activeItemId
}: ResponsiveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(
    activeItemId || items.find(item => item.active)?.id || items[0]?.id
  );
  const [isMobile, setIsMobile] = useState(false);

  // Sync activeItem with activeItemId prop when it changes
  useEffect(() => {
    if (activeItemId) {
      setActiveItem(activeItemId);
    }
  }, [activeItemId]);

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cerrar menú móvil cuando se cambia a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.id);
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onItemClick) {
      onItemClick(item);
    }

    // Cerrar menú móvil después de hacer clic
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <nav className="p-2">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                          activeItem === item.id
                            ? "bg-purple-500 text-white shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <span className="flex-shrink-0">
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {activeItem === item.id && (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:block">
        <nav className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="container-fluid px-4 py-3">
            <ul className="flex flex-wrap items-center justify-center gap-2 lg:gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex-shrink-0">
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                      activeItem === item.id
                        ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    )}
                  >
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="hidden lg:inline">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

// Componente de ejemplo de uso
export function ResponsiveMenuExample() {
  const [selectedItem, setSelectedItem] = useState<string>('overview');

  const handleMenuItemClick = (item: MenuItem) => {
    console.log('Menu item clicked:', item);
    setSelectedItem(item.id);
  };

  const customItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Hexagon className="w-4 h-4" />,
      active: selectedItem === 'dashboard'
    },
    {
      id: 'properties',
      label: 'Propiedades',
      icon: <Home className="w-4 h-4" />,
      active: selectedItem === 'properties'
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: <TrendingUp className="w-4 h-4" />,
      active: selectedItem === 'analytics'
    },
    {
      id: 'tools',
      label: 'Herramientas',
      icon: <Wand2 className="w-4 h-4" />,
      active: selectedItem === 'tools'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Menú por Defecto
        </h3>
        <ResponsiveMenu onItemClick={handleMenuItemClick} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Menú Personalizado
        </h3>
        <ResponsiveMenu 
          items={customItems}
          onItemClick={handleMenuItemClick}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Elemento seleccionado: <strong>{selectedItem}</strong>
        </p>
      </div>
    </div>
  );
}
