"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

const clients = [
  {
    id: 1,
    name: "Kiruna",
    logo: "/images/clients/canva-logo-kiruna.png"
  },
  {
    id: 2,
    name: "Inmobiliaria Bogotá",
    logo: "/images/clients/canva-logo-inmobiliariabogota.png"
  },
  {
    id: 3,
    name: "Mendebal",
    logo: "/images/clients/canva-logo-mendebal.png"
  },
  {
    id: 4,
    name: "Maya",
    logo: "/images/clients/canva-logo-maya.png"
  },
  {
    id: 5,
    name: "Logan",
    logo: "/images/clients/canva-logo-logan.png"
  },
  {
    id: 6,
    name: "JLL",
    logo: "/images/clients/canva-logo-jll.png"
  },
  {
    id: 7,
    name: "Grupo Macana",
    logo: "/images/clients/canva-logo-grupomacana.png"
  },
  {
    id: 8,
    name: "Diagonal",
    logo: "/images/clients/canva-logo-diagonal2.png"
  },
  {
    id: 9,
    name: "Cumbrera",
    logo: "/images/clients/canva-logo-cumbrera.png"
  },
  {
    id: 10,
    name: "Colliers",
    logo: "/images/clients/canva-logo-colliers.png"
  },
  {
    id: 11,
    name: "Coandes",
    logo: "/images/clients/canva-logo-coandes.png"
  },
  {
    id: 12,
    name: "CBRE",
    logo: "/images/clients/canva-logo-cbre.png"
  },
  {
    id: 13,
    name: "Black Horse",
    logo: "/images/clients/canva-logo-blackhorse.png"
  },
  {
    id: 14,
    name: "ABG",
    logo: "/images/clients/canva-logo-abg.png"
  },
  {
    id: 15,
    name: "Cimento Fontanar",
    logo: "/images/clients/canva-logo-CimentoFontanar.png"
  }
];

export default function Clients() {
  const { theme } = useTheme();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scrollWidth = carousel.scrollWidth;
    const clientWidth = scrollWidth / 2;
    let position = currentPosition;

    const animate = () => {
      position -= 2;
      if (position <= -clientWidth) {
        position = 0;
      }
      setCurrentPosition(position);
      carousel.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [currentPosition, mounted]);

  return (
    <section id="clients" className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-3xl md:text-4xl font-bold mb-16 text-center ${
          mounted && theme === 'dark' ? 'text-white' : 'text-neutral-800'
        }`}>
          Empresas que confían en Urbex
        </h2>

        <div className="relative w-full overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex"
            style={{
              width: 'max-content',
              display: 'flex',
              gap: '3rem'
            }}
          >
            {/* First copy of logos */}
            {clients.map((client) => (
              <div
                key={`first-${client.id}`}
                className="flex-shrink-0 w-32 h-32 relative"
                onMouseEnter={() => setHoveredLogo(`first-${client.id}`)}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  fill
                  className={`object-contain transition-all duration-300 ${
                    mounted && theme === 'dark' 
                      ? 'brightness-10 invert opacity-60' 
                      : hoveredLogo === `first-${client.id}`
                        ? 'brightness-80' 
                        : 'brightness-10 opacity-40'
                  }`}
                  style={{ 
                    backgroundColor: 'transparent',
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
            ))}
            
            {/* Second copy of logos for infinite effect */}
            {clients.map((client) => (
              <div
                key={`second-${client.id}`}
                className="flex-shrink-0 w-32 h-32 relative"
                onMouseEnter={() => setHoveredLogo(`second-${client.id}`)}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  fill
                  className={`object-contain transition-all duration-300 ${
                    mounted && theme === 'dark' 
                      ? 'brightness-10 invert opacity-60' 
                      : hoveredLogo === `second-${client.id}`
                        ? 'brightness-80' 
                        : 'brightness-10 opacity-40'
                  }`}
                  style={{ 
                    backgroundColor: 'transparent',
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 