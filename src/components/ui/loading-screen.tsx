'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface LoadingScreenProps {
  isVisible?: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  isVisible = false, 
  message = "Cargando...", 
  fullScreen = true 
}: LoadingScreenProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isVisible) return null;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo */}
      <div className="mb-4">
        {mounted ? (
          <Image 
            src={(theme === "dark" || resolvedTheme === "dark") ? "/images/urbex-white.svg" : "/images/urbex-logo.svg"} 
            alt="Urbex Logo" 
            width={120}
            height={26}
            className="w-auto h-10" 
          />
        ) : (
          <Image 
            src="/images/urbex-logo.svg" 
            alt="Urbex Logo" 
            width={120}
            height={26}
            className="w-auto h-10" 
          />
        )}
      </div>

      {/* Spinner */}
      <div className="relative">
        <div 
          className={`w-12 h-12 rounded-full border-4 ${
            mounted && (theme === "dark" || resolvedTheme === "dark")
              ? "border-gray-700 border-t-blue-400"
              : "border-gray-200 border-t-blue-500"
          } animate-spin`}
        />
        <Loader2 className="absolute inset-0 w-6 h-6 m-auto text-blue-500 opacity-0" />
      </div>

      {/* Loading message */}
      <p className={`text-sm font-medium ${
        mounted && (theme === "dark" || resolvedTheme === "dark")
          ? "text-gray-300"
          : "text-gray-600"
      }`}>
        {message}
      </p>

      {/* Loading dots animation */}
      <div className="flex space-x-1">
        <div 
          className={`w-2 h-2 rounded-full animate-pulse ${
            mounted && (theme === "dark" || resolvedTheme === "dark")
              ? "bg-blue-400"
              : "bg-blue-500"
          }`}
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className={`w-2 h-2 rounded-full animate-pulse ${
            mounted && (theme === "dark" || resolvedTheme === "dark")
              ? "bg-blue-400"
              : "bg-blue-500"
          }`}
          style={{ animationDelay: '150ms' }}
        />
        <div 
          className={`w-2 h-2 rounded-full animate-pulse ${
            mounted && (theme === "dark" || resolvedTheme === "dark")
              ? "bg-blue-400"
              : "bg-blue-500"
          }`}
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        mounted && (theme === "dark" || resolvedTheme === "dark")
          ? "bg-neutral-900/95"
          : "bg-white/95"
      } backdrop-blur-sm`}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

// Hook for managing loading state
export function useLoadingScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Cargando...");

  const showLoading = (loadingMessage?: string) => {
    if (loadingMessage) setMessage(loadingMessage);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setMessage("Cargando...");
  };

  return {
    isLoading,
    message,
    showLoading,
    hideLoading
  };
} 