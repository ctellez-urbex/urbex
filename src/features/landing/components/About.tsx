"use client";

import { useTheme } from "next-themes";
import { memo, useMemo, useCallback } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface AboutCard {
  image: string;
  title: string;
  points: string[];
}

const cards: AboutCard[] = [
  {
    image: "/images/about/optimized/msv29.webp",
    title: "Equipos comerciales",
    points: [
      "Generar leads de propietarios segmentados y georreferenciados",
      "Engorde de leads con información de propiedades y vehículos",
      "Seguimiento de precios en el mercado secundario de los proyectos de las constructoras",
      "Estudios de mercado a la medida"
    ]
  },
  {
    image: "/images/about/optimized/msv33.webp",
    title: "Equipos de expansión",
    points: [
      "Acceder a cualquier tipo de activo inmobiliario, aún cuando no está listado en el mercado",
      "Anlálisis de georreferenciación de la competencia",
      "Acceso a datos de contacto de propietarios de los locales de interés"
    ]
  },
  {
    image: "/images/about/optimized/msv31.webp",
    title: "Equipos de estructuración",
    points: [
      "Algoritmo para búsqueda activa de lotes",
      "Consolidación de lotes",
      "Acceso a datos de quienes son los propietarios de cada lote",
      "Análisis de prefactibilidad según la normativa urbana vigente y potencial de desarrollo del lote"
    ]
  },
  {
    image: "/images/about/optimized/msv36.webp",
    title: "Brokeraje",
    points: [
      "Due diligence de cualquier activo inmobiliario en tiempo real",
      "Potencializar la captación de activos para venta o arriendo",
      "Estudio de mercado y análisis de precios de cierre, oferta y avalúos catastrales",
      "Generación de reportes"
    ]
  }
];

interface AboutCardComponentProps {
  card: AboutCard;
  index: number;
  isDark: boolean;
}

const AboutCardComponent = memo(({ card, index, isDark }: AboutCardComponentProps) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/images/about/fallback.jpg';
  }, []);

  const cardClasses = useMemo(() => {
    return `rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
      isDark 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-white hover:bg-gray-50'
    }`;
  }, [isDark]);

  return (
    <article 
      className={cardClasses}
      role="article"
      aria-labelledby={`about-title-${index}`}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={card.image}
          alt={`${card.title} illustration`}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={handleImageError}
          priority={index < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 
          id={`about-title-${index}`}
          className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-neutral-800'
          }`}
        >
          {card.title}
        </h3>
        
        <ul className="space-y-3" role="list">
          {card.points.map((point, pointIndex) => (
            <li 
              key={pointIndex} 
              className="flex items-start space-x-3"
              role="listitem"
            >
              <CheckCircle 
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} 
                aria-hidden="true"
              />
              <span className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
});

AboutCardComponent.displayName = 'AboutCardComponent';

const About = memo(() => {
  const { theme, resolvedTheme } = useTheme();

  const isDark = useMemo(() => 
    theme === 'dark' || resolvedTheme === 'dark', 
    [theme, resolvedTheme]
  );

  const memoizedCards = useMemo(() => 
    cards.map((card, index) => (
      <AboutCardComponent
        key={index}
        card={card}
        index={index}
        isDark={isDark}
      />
    )), 
    [isDark]
  );

  return (
    <section 
      id="about" 
      className="py-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            id="about-heading"
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-neutral-800'
            }`}
          >
            Ideal para...
          </h2>
          <p className={`max-w-3xl mx-auto text-lg ${
            isDark ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            Descubre cómo diferentes equipos pueden aprovechar Urbex para mejorar sus operaciones inmobiliarias
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          role="list"
          aria-label="Team types and benefits"
        >
          {memoizedCards}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className={`p-8 rounded-2xl ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h3 className={`text-2xl font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Listo para transformar tus operaciones inmobiliarias?
            </h3>
            <p className={`text-lg mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Únete a cientos de equipos que ya están usando Urbex para tomar decisiones mejor informadas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Iniciar prueba gratuita
              </a>
              <a
                href="#contact"
                className={`inline-flex items-center px-6 py-3 border-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'border-gray-600 text-white hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Programar demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About; 