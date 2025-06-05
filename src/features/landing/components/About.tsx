"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function About() {
  const { theme } = useTheme();

  const cards = [
    {
      image: "/images/about/msv29.jpg",
      title: "Equipos comerciales",
      points: [
        "Generar leads de propietarios segmentados y georreferenciados",
        "Engorde de leads con información de propiedades y vehículos",
        "Seguimiento de precios en el mercado secundario de los proyectos de las constructoras",
        "Estudios de mercado a la medida"
      ]
    },
    {
      image: "/images/about/msv33.jpg",
      title: "Equipos de expansión",
      points: [
        "Acceder a cualquier tipo de activo inmobiliario, aún cuando no está listado en el mercado",
        "Anlálisis de georreferenciación de la competencia",
        "Acceso a datos de contacto de propietarios de los locales de interés"
      ]
    },
    {
      image: "/images/about/msv31.jpg",
      title: "Equipos de estructuración",
      points: [
        "Algoritmo para búsqueda activa de lotes",
        "Consolidación de lotes",
        "Acceso a datos de quienes son los propietarios de cada lote",
        "Análisis de prefactibilidad según la normativa urbana vigente y potencial de desarrollo del lote"
      ]
    },
    {
      image: "/images/about/msv36.jpg",
      title: "Brokeraje",
      points: [
        "Due diligence de cualquier activo inmobiliario en tiempo real",
        "Potencializar la captación de activos para venta o arriendo",
        "Estudio de mercado y análisis de precios de cierre, oferta y avalúos catastrales",
        "Generación de reportes"
      ]
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 ${
          theme === 'dark' ? 'text-white' : 'text-neutral-800'
        }`}>
          Ideal para ...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-neutral-800 hover:bg-neutral-700' 
                  : 'bg-white hover:bg-neutral-50'
              } shadow-lg hover:shadow-xl`}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 w-full">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className={`text-lg sm:text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-800'
                }`}>
                  {card.title}
                </h3>
                
                <ul className="space-y-2">
                  {card.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-2">
                      <span className={`text-purple-500 mt-1 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                      }`}>*</span>
                      <span className={`text-sm sm:text-base ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 