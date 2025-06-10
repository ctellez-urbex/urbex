"use client";

import { useState, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  darkColor: string;
}

const serviceCards: ServiceCard[] = [
  {
    id: 1,
    title: "Precios de cierre",
    description: "Contamos con todos los precios de cierre de las propiedades para que tengas un precio de referencia más ajustado.",
    icon: "/images/services/bar-stats.svg",
    color: "bg-blue-50",
    darkColor: "bg-blue-900/20"
  },
  {
    id: 2,
    title: "Últimas transacciones",
    description: "Cuáles son las últimas transacciones o anotaciones de una propiedad.",
    icon: "/images/services/market-analysis.svg",
    color: "bg-green-50",
    darkColor: "bg-green-900/20"
  },
  {
    id: 3,
    title: "Avalúos catastrales y prediales",
    description: "Histórico de los avalúos catastrales e impuesto prediales",
    icon: "/images/services/house.svg",
    color: "bg-purple-50",
    darkColor: "bg-purple-900/20"
  },
  {
    id: 4,
    title: "Datos de contacto de propietarios",
    description: "Acceso a información de contacto de quienes son los propietarios de cada predio.",
    icon: "/images/services/phone.svg",
    color: "bg-amber-50",
    darkColor: "bg-amber-900/20"
  },
  {
    id: 5,
    title: "Dinámicas de precios de oferta en venta y renta",
    description: "Análisis de cómo se han comportado los precios en venta y renta en el sector.",
    icon: "/images/services/money-bag.svg",
    color: "bg-rose-50",
    darkColor: "bg-rose-900/20"
  },
  {
    id: 6,
    title: "Lotes, licencias de construcción y normativa urbana",
    description: "Análisis de prefactibilidad de desarrollo inmobiliario en cada lote de acuerdo a la normativa urbana vigente.",
    icon: "/images/services/world.svg",
    color: "bg-teal-50",
    darkColor: "bg-teal-900/20"
  }
];

interface ServiceCardComponentProps {
  card: ServiceCard;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  isDark: boolean;
}

const ServiceCardComponent = memo(({ card, isHovered, onHover, isDark }: ServiceCardComponentProps) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/images/services/fallback.svg';
  }, []);

  const cardBackgroundClass = useMemo(() => {
    if (isDark) {
      return isHovered ? 'bg-gray-800 shadow-xl' : 'bg-gray-800/80 shadow-lg';
    }
    return isHovered ? `${card.color} shadow-xl` : `${card.color} shadow-md`;
  }, [isDark, isHovered, card.color]);

  const iconBackgroundClass = useMemo(() => {
    if (isDark) {
      return card.darkColor;
    }
    return 'bg-white/80';
  }, [isDark, card.darkColor]);

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 transform cursor-pointer ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${cardBackgroundClass}`}
      onMouseEnter={() => onHover(card.id)}
      onMouseLeave={() => onHover(null)}
      role="article"
      aria-labelledby={`service-title-${card.id}`}
    >
      <div className="flex items-center justify-center mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconBackgroundClass}`}>
          <Image
            src={card.icon}
            alt={`${card.title} icon`}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority={card.id <= 3}
            onError={handleImageError}
          />
        </div>
      </div>
      
      <h3 
        id={`service-title-${card.id}`}
        className={`text-xl font-bold mb-3 text-center ${
          isDark ? 'text-white' : 'text-neutral-800'
        }`}
      >
        {card.title}
      </h3>
      
      <p className={`text-base text-center leading-relaxed ${
        isDark ? 'text-gray-300' : 'text-neutral-600'
      }`}>
        {card.description}
      </p>
    </div>
  );
});

ServiceCardComponent.displayName = 'ServiceCardComponent';

const Services = memo(() => {
  const { theme, resolvedTheme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const isDark = useMemo(() => 
    theme === 'dark' || resolvedTheme === 'dark', 
    [theme, resolvedTheme]
  );

  const handleCardHover = useCallback((id: number | null) => {
    setHoveredCard(id);
  }, []);

  const memoizedServiceCards = useMemo(() => 
    serviceCards.map((card) => (
      <ServiceCardComponent
        key={card.id}
        card={card}
        isHovered={hoveredCard === card.id}
        onHover={handleCardHover}
        isDark={isDark}
      />
    )), 
    [hoveredCard, handleCardHover, isDark]
  );

  return (
    <section 
      id="services" 
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            id="services-heading"
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-neutral-800'
            }`}
          >
            Urbex Information
          </h2>
          <p className={`max-w-3xl mx-auto text-lg ${
            isDark ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            What information can you find in Urbex?
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          role="list"
          aria-label="Services offered"
        >
          {memoizedServiceCards}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className={`text-lg mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Listo para desbloquear el potencial de tu propiedad?
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Iniciar hoy
          </a>
        </div>
      </div>
    </section>
  );
});

Services.displayName = 'Services';

export default Services; 