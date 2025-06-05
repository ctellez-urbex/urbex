"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const serviceCards: ServiceCard[] = [
  {
    id: 1,
    title: "Precios de cierre",
    description: "Contamos con todos los precios de cierre de las propiedades para que tengas un precio de referencia más ajustado.",
    icon: "/images/services/bar-stats.svg",
    color: "bg-blue-50"
  },
  {
    id: 2,
    title: "Últimas transacciones",
    description: "Cuáles son las últimas transacciones o anotaciones de una propiedad.",
    icon: "/images/services/market-analysis.svg",
    color: "bg-green-50"
  },
  {
    id: 3,
    title: "Avalúos catastrales y prediales",
    description: "Histórico de los avalúos catastrales e impuesto prediales",
    icon: "/images/services/house.svg",
    color: "bg-purple-50"
  },
  {
    id: 4,
    title: "Datos de contacto de propietarios",
    description: "Acceso a información de contacto de quienes son los propietarios de cada predio.",
    icon: "/images/services/phone.svg",
    color: "bg-amber-50"
  },
  {
    id: 5,
    title: "Dinámicas de precios de oferta en venta y renta",
    description: "Análisis de cómo se han comportado los precios en venta y renta en el sector.",
    icon: "/images/services/money-bag.svg",
    color: "bg-rose-50"
  },
  {
    id: 6,
    title: "Lotes, licencias de construcción y normativa urbana",
    description: "Análisis de prefactibilidad de desarrollo inmobiliario en cada lote de acuerdo a la normativa urbana vigente.",
    icon: "/images/services/world.svg",
    color: "bg-teal-50"
  }
];

export default function Services() {
  const { theme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>
            Información de Urbex
          </h2>
          <p className={`max-w-3xl mx-auto text-base sm:text-lg ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
            ¿Qué información puedes encontrar en Urbex?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {serviceCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl p-5 sm:p-6 transition-all duration-300 transform ${
                hoveredCard === card.id ? 'scale-105' : 'scale-100'
              } ${
                theme === 'dark' 
                  ? 'bg-white shadow-lg' 
                  : `${card.color} shadow-md`
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  theme === 'dark' 
                    ? card.color
                    : 'bg-white/80'
                }`}>
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={32}
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                    priority={card.id <= 3}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/services/fallback.svg';
                    }}
                  />
                </div>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center ${
                theme === 'dark' ? 'text-neutral-800' : 'text-neutral-800'
              }`}>
                {card.title}
              </h3>
              <p className={`text-sm sm:text-base text-center ${
                theme === 'dark' ? 'text-neutral-600' : 'text-neutral-600'
              }`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 