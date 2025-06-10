"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface CarouselImage {
  src: string;
  alt: string;
  fallbackSrc: string;
}

const carouselImages: CarouselImage[] = [
  {
    src: "/images/hero/optimized/msv39.webp",
    alt: "Principal",
    fallbackSrc: "/images/hero/msv39.jpg"
  },
  {
    src: "/images/hero/optimized/msv41.webp",
    alt: "Estructuración",
    fallbackSrc: "/images/hero/msv41.jpg"
  },
  {
    src: "/images/hero/optimized/msv42.webp",
    alt: "Expansión",
    fallbackSrc: "/images/hero/msv42.jpg"
  },
  {
    src: "/images/hero/optimized/msv40.webp",
    alt: "Brokeraje",
    fallbackSrc: "/images/hero/msv40.jpg"
  },
  {
    src: "/images/hero/optimized/msv34.webp",
    alt: "Equipos comerciales",
    fallbackSrc: "/images/hero/msv34.jpg"
  }
];

// Configuration constants
const SLIDE_INTERVAL = 6000;
const TRANSITION_DURATION = 1000;
const ZOOM_EFFECT = true;

const Hero = memo(() => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageSources, setImageSources] = useState<string[]>(
    carouselImages.map(img => img.src)
  );
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle image errors with fallback
  const handleImageError = useCallback((index: number) => {
    setImageSources(prev => {
      const newSources = [...prev];
      newSources[index] = carouselImages[index].fallbackSrc;
      return newSources;
    });
  }, []);

  // Navigation functions
  const changeImage = useCallback((direction: 'next' | 'prev' | number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (typeof direction === 'number') {
      setCurrentImage(direction);
    } else if (direction === 'next') {
      setCurrentImage(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    } else {
      setCurrentImage(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));
    }
    
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [isTransitioning]);

  // Auto-advance logic
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      changeImage('next');
    }, SLIDE_INTERVAL);
    
    intervalRef.current = interval;
    
    return () => clearInterval(interval);
  }, [isPaused, changeImage]);

  // Interaction handlers
  const pauseCarousel = useCallback(() => setIsPaused(true), []);
  const resumeCarousel = useCallback(() => setIsPaused(false), []);

  // Scroll functions
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Memoized styles
  const overlayStyle = useMemo(() => 
    mounted && theme === 'dark' ? 'bg-black/40' : 'bg-white/60'
  , [theme, mounted]);

  const textColorClass = useMemo(() => 
    mounted && theme === 'dark' ? 'text-white' : 'text-neutral-800'
  , [theme, mounted]);

  const buttonStyles = useMemo(() => ({
    primary: mounted && theme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: mounted && theme === 'dark' 
      ? 'bg-transparent border-2 border-white hover:bg-white/20 text-white' 
      : 'bg-transparent border-2 border-neutral-800 hover:bg-neutral-800/10 text-neutral-800'
  }), [theme, mounted]);

  return (
    <section 
      id="hero" 
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={pauseCarousel}
      onMouseLeave={resumeCarousel}
      onTouchStart={pauseCarousel}
      onTouchEnd={resumeCarousel}
    >
      {/* Carousel Images */}
      <div className="absolute inset-0">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className={`absolute inset-0 ${overlayStyle} z-10`} />
            <Image
              src={imageSources[index]}
              alt={image.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
              onError={() => handleImageError(index)}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1">
        <div 
          className={`h-full bg-blue-500 transition-all duration-300 ${
            isPaused ? 'opacity-50' : 'opacity-70'
          }`}
          style={{ 
            width: isPaused ? '0%' : '100%', 
            transition: isPaused ? 'none' : `width ${SLIDE_INTERVAL}ms linear` 
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full mx-auto text-center">
          <div className="space-y-6 sm:space-y-8">
            {/* Main Heading */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${textColorClass}`}>
              <span className="block">Información</span>
              <span className="block text-blue-500">Inmobiliaria</span>
              <span className="block">Completa</span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed ${textColorClass} opacity-90`}>
              Accede a toda la información de cualquier propiedad o lote de forma fácil y rápida
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <button
                onClick={() => scrollToSection('services')}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${buttonStyles.primary}`}
              >
                Explorar Ahora
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${buttonStyles.secondary}`}
              >
                Más Información
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only visible on desktop */}
      <div className="hidden md:block">
        <button
          onClick={() => changeImage('prev')}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            mounted && theme === 'dark' ? 'bg-black/30 hover:bg-black/50 text-white' : 'bg-white/50 hover:bg-white/70 text-neutral-800'
          }`}
          aria-label="Imagen anterior"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => changeImage('next')}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            mounted && theme === 'dark' ? 'bg-black/30 hover:bg-black/50 text-white' : 'bg-white/50 hover:bg-white/70 text-neutral-800'
          }`}
          aria-label="Siguiente imagen"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => changeImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentImage 
                ? `scale-125 ${mounted && theme === 'dark' ? 'bg-white' : 'bg-neutral-800'}` 
                : `${mounted && theme === 'dark' ? 'bg-white/50 hover:bg-white/80' : 'bg-neutral-800/50 hover:bg-neutral-800/80'}`
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero; 