"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface CarouselImage {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

const carouselImages: CarouselImage[] = [
  {
    src: "/images/hero/msv39.jpg",
    alt: "Pricipal",
    fallbackSrc: "https://placehold.co/1920x1080/222222/FFFFFF?text=Urban+Exploration+1"
  },
  {
    src: "/images/hero/msv41.jpg",
    alt: "Estructuración",
    fallbackSrc: "https://placehold.co/1920x1080/222222/FFFFFF?text=Urban+Exploration+2"
  },
  {
    src: "/images/hero/msv42.jpg",
    alt: "Expansion",
    fallbackSrc: "https://placehold.co/1920x1080/222222/FFFFFF?text=Urban+Exploration+3"
  },
  {
    src: "/images/hero/msv40.jpg",
    alt: "Brokeraje",
    fallbackSrc: "https://placehold.co/1920x1080/222222/FFFFFF?text=Urban+Exploration+4"
  },
  {
    src: "/images/hero/msv34.jpg",
    alt: "Equipos comerciales",
    fallbackSrc: "https://placehold.co/1920x1080/222222/FFFFFF?text=Urban+Exploration+4"
  }
];

// Configuración del carrusel
const TRANSITION_DURATION = 1000; // duración de la transición en ms
const SLIDE_INTERVAL = 6000; // tiempo entre cambios de imagen en ms
const ZOOM_EFFECT = true; // activar efecto de zoom en las imágenes

export default function Hero() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageSources, setImageSources] = useState<string[]>(
    carouselImages.map(img => img.src)
  );
  const [imageErrors, setImageErrors] = useState<boolean[]>(Array(carouselImages.length).fill(false));
  
  // Referencia para el intervalo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log image paths for debugging
  useEffect(() => {
    console.log("Image paths:", imageSources);
  }, [imageSources]);

  // Handle image errors by using fallback sources
  const handleImageError = (index: number) => {
    console.log(`Error loading image at index ${index}:`, imageSources[index]);
    setImageErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
    setImageSources(prev => {
      const newSources = [...prev];
      newSources[index] = carouselImages[index].fallbackSrc || prev[index];
      console.log(`Using fallback for index ${index}:`, newSources[index]);
      return newSources;
    });
  };

  // Función para iniciar el intervalo de cambio automático
  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        nextImage();
      }
    }, SLIDE_INTERVAL);
  };

  // Auto-advance carousel
  useEffect(() => {
    startAutoSlide();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentImage, isPaused]);

  // Pausar el carrusel cuando el usuario interactúa con él
  const pauseCarousel = () => setIsPaused(true);
  const resumeCarousel = () => setIsPaused(false);

  const nextImage = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentImage((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  };

  const prevImage = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentImage((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  };

  const goToImage = (index: number) => {
    if (!isTransitioning && index !== currentImage) {
      setIsTransitioning(true);
      setCurrentImage(index);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine text color based on theme
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-neutral-800';

  return (
    <section 
      id="explorar" 
      className="relative h-screen w-full overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
      onMouseEnter={pauseCarousel}
      onMouseLeave={resumeCarousel}
      onTouchStart={pauseCarousel}
      onTouchEnd={resumeCarousel}
    >
      {/* Carousel Images */}
      <div className="absolute inset-0 w-full h-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-${TRANSITION_DURATION} ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-white/70'} z-10`} />
            <Image
              src={imageSources[index]}
              alt={image.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              className={`object-cover ${ZOOM_EFFECT && index === currentImage ? 'animate-scale' : ''}`}
              onError={() => handleImageError(index)}
              unoptimized={true}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-transparent">
        <div 
          className={`h-full bg-blue-500 transition-all duration-300 ${isPaused ? 'opacity-50' : 'opacity-70'}`}
          style={{ 
            width: isPaused ? '0%' : '100%', 
            transition: isPaused ? 'none' : `width ${SLIDE_INTERVAL}ms linear` 
          }}
        />
      </div>

      {/* Content - Two Column Layout */}
      <div className="relative z-20 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center md:text-left space-y-4 md:space-y-6">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-slideIn ${textColorClass}`}>
              Accede a toda la información de cualquier propiedad o lote
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl animate-slideIn ${textColorClass} opacity-90`} style={{ animationDelay: "0.2s" }}>
              De forma fácil y rápida con nuestra plataforma especializada
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slideIn justify-center md:justify-start" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={scrollToServices}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Explorar Ahora
              </button>
              <button
                onClick={scrollToContact}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-md text-base sm:text-lg font-medium transition-all ${theme === 'dark' ? 'bg-transparent border-2 border-white hover:bg-white/20 text-white' : 'bg-transparent border-2 border-neutral-800 hover:bg-neutral-800/10 text-neutral-800'}`}
              >
                Más Información
              </button>
            </div>
          </div>
          
          {/* Right Column - Visual Element or Empty Space */}
          <div className="hidden md:flex justify-center items-center">
            <div className={`relative w-80 h-80 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100/50'} backdrop-blur-sm animate-pulse`}>
              <div className="absolute inset-4 rounded-full border-4 border-dashed border-blue-500/30 animate-spin-slow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          prevImage();
          pauseCarousel();
          setTimeout(resumeCarousel, 3000);
        }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full ${
          theme === 'dark' ? 'bg-black/30 hover:bg-black/50 text-white' : 'bg-white/50 hover:bg-white/70 text-neutral-800'
        } transition-all`}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => {
          nextImage();
          pauseCarousel();
          setTimeout(resumeCarousel, 3000);
        }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full ${
          theme === 'dark' ? 'bg-black/30 hover:bg-black/50 text-white' : 'bg-white/50 hover:bg-white/70 text-neutral-800'
        } transition-all`}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              goToImage(index);
              pauseCarousel();
              setTimeout(resumeCarousel, 3000);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentImage 
                ? theme === 'dark' ? "bg-white scale-125" : "bg-neutral-800 scale-125" 
                : theme === 'dark' ? "bg-white/50 hover:bg-white/80" : "bg-neutral-800/50 hover:bg-neutral-800/80"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 