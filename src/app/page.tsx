'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from "@/features/landing"

export default function Home() {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Si el usuario está autenticado, redirigir al dashboard
    if (!loading && user && typeof window !== 'undefined') {
      // Use /dashboard/ in development, /dashboard/index.html in production/static
      const dashboardPath = process.env.NODE_ENV === 'development' 
        ? '/dashboard/' 
        : '/dashboard/index.html';
      window.location.href = dashboardPath
    }
  }, [user, loading])

  // Mostrar landing page mientras se verifica auth o si no está autenticado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si está autenticado, mostrar loading mientras redirige
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <LandingPage />
}
