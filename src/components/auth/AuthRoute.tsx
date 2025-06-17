'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/loading-screen'

interface AuthRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard/index.html' 
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      setIsNavigating(true)
      // Use replace instead of push to avoid adding to history
      router.replace(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading screen while checking auth status or navigating
  if (loading || isNavigating) {
    return (
      <LoadingScreen 
        isVisible={true} 
        message={loading ? "Verificando sesión..." : "Redirigiendo..."} 
      />
    )
  }

  // Don't render anything if user is already authenticated
  if (user) {
    return null
  }

  return <>{children}</>
} 