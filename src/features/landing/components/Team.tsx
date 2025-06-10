"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Team() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const team = [
    {
      name: "Alejandro Gaviria",
      role: "Co-Fundador",
      image: "/images/founders/alejandrogaviriaimg.jpg",
      description: "Ex-Habi Chief of Data | Ex-Buydepa Country Manager y Chief of Data"
    },
    {
      name: "Diego Rodriguez",
      role: "Co-Fundador",
      image: "/images/founders/diegorodriguezimg.jpg",
      description: "Ex-socio Corredores Asociados | Ex-socio Correval | Co-fundador Bosk Capital"
    },
    {
      name: "German Rojas",
      role: "Co-Fundador",
      image: "/images/founders/germanrojasimg.jpg",
      description: "Co-Fundador y Managing Partner en Kiruna Capital Partner | Ex gerente general de Terranum"
    },
    {
      name: "Felipe Pacheco",
      role: "Co-Fundador",
      image: "/images/founders/felipepachecoimg.jpg",
      description: "Socio en Kiruna Capital Partner | Ex-Brigard & Urrutia Abogados"
    }
  ];

  return (
    <section id="team" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
            mounted && theme === 'dark' ? 'text-white' : 'text-neutral-800'
          }`}>
            Nuestro Equipo
          </h2>

          <p className={`text-lg ${
            mounted && theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            En Urbex, contamos con un equipo multidisciplinario de expertos apasionados por la innovación 
            y el análisis inmobiliario. Nuestra combinación única de experiencia en tecnología, datos y 
            bienes raíces nos permite ofrecer soluciones excepcionales a nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Image Container with Shadow */}
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]"></div>
                <div className="relative w-full h-full overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mt-4 text-center">
                <h3 className={`text-xl font-semibold mb-1 ${
                  mounted && theme === 'dark' ? 'text-white' : 'text-neutral-800'
                }`}>
                  {member.name}
                </h3>
                <p className={`font-medium mb-2 ${
                  mounted && theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {member.role}
                </p>
                <p className={`text-sm ${
                  mounted && theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 