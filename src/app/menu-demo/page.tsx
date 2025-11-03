"use client";

import React, { useState } from 'react';
import ResponsiveMenu from '@/components/ui/responsive-menu';
import { 
  Hexagon, 
  Home, 
  TrendingUp, 
  Wand2, 
  Users, 
  Search,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export default function MenuDemoPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [notification, setNotification] = useState<string>('');

  // Menú principal basado en el HTML proporcionado
  const mainMenuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Descripción General',
      icon: <Hexagon className="w-4 h-4" />,
      active: activeSection === 'overview'
    },
    {
      id: 'unit-analysis',
      label: 'Análisis de unidad',
      icon: <Home className="w-4 h-4" />,
      active: activeSection === 'unit-analysis'
    },
    {
      id: 'market-study',
      label: 'Estudio de mercado',
      icon: <TrendingUp className="w-4 h-4" />,
      active: activeSection === 'market-study'
    },
    {
      id: 'lot-simulation',
      label: 'Simulación de desarrollo del lote',
      icon: <Wand2 className="w-4 h-4" />,
      active: activeSection === 'lot-simulation'
    },
    {
      id: 'owners',
      label: 'Propietarios',
      icon: <Users className="w-4 h-4" />,
      active: activeSection === 'owners'
    },
    {
      id: 'new-search',
      label: 'Nueva búsqueda',
      icon: <Search className="w-4 h-4" />,
      active: activeSection === 'new-search'
    }
  ];

  // Menú secundario para demostrar versatilidad
  const secondaryMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      active: activeSection === 'dashboard'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <FileText className="w-4 h-4" />,
      active: activeSection === 'reports'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="w-4 h-4" />,
      active: activeSection === 'settings'
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    setActiveSection(item.id);
    setNotification(`Navegaste a: ${item.label}`);
    
    // Limpiar notificación después de 3 segundos
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Descripción General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Resumen del Proyecto
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Información general sobre el desarrollo inmobiliario y sus características principales.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Métricas Clave
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Indicadores principales del rendimiento y viabilidad del proyecto.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Estado Actual
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Progreso actual del análisis y próximos pasos a seguir.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'unit-analysis':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Análisis de Unidad
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Análisis detallado de las unidades individuales, incluyendo áreas, distribución y características específicas.
              </p>
            </div>
          </div>
        );
      
      case 'market-study':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Estudio de Mercado
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Investigación del mercado inmobiliario local, precios comparativos y tendencias del sector.
              </p>
            </div>
          </div>
        );
      
      case 'lot-simulation':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Simulación de Desarrollo del Lote
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Modelado y simulación de diferentes escenarios de desarrollo para optimizar el uso del terreno.
              </p>
            </div>
          </div>
        );
      
      case 'owners':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Propietarios
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Información sobre los propietarios actuales y históricos del inmueble.
              </p>
            </div>
          </div>
        );
      
      case 'new-search':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nueva Búsqueda
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Iniciar una nueva búsqueda de propiedades con diferentes criterios.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Contenido para la sección: {activeSection}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Demo del Menú Responsive
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Modo: {typeof window !== 'undefined' && window.innerWidth < 768 ? 'Móvil' : 'Desktop'}
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4">
          <div className="container mx-auto px-4">
            <p className="text-green-700 dark:text-green-300">
              {notification}
            </p>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Menú Principal
          </h3>
          <ResponsiveMenu 
            items={mainMenuItems}
            onItemClick={handleMenuClick}
          />
        </div>

        {/* Secondary Menu */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Menú Secundario
          </h3>
          <ResponsiveMenu 
            items={secondaryMenuItems}
            onItemClick={handleMenuClick}
          />
        </div>

        {/* Content Area */}
        <main className="mt-8">
          {renderContent()}
        </main>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Instrucciones de Uso
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p><strong>En móvil:</strong> Toca el botón de menú (☰) para abrir el menú desplegable</p>
            <p><strong>En tablet/desktop:</strong> El menú se muestra extendido horizontalmente</p>
            <p><strong>Tema:</strong> El menú se adapta automáticamente al modo claro/oscuro del sistema</p>
            <p><strong>Responsive:</strong> El diseño se ajusta automáticamente según el tamaño de pantalla</p>
          </div>
        </div>
      </div>
    </div>
  );
}
