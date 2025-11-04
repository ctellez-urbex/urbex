'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo 
}) => {
  // Default redirect: /auth/login/ in development, /auth/login/index.html in production/static
  const defaultRedirect = process.env.NODE_ENV === 'development' 
    ? '/auth/login/' 
    : '/auth/login/index.html';
  const finalRedirectTo = redirectTo || defaultRedirect;
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(finalRedirectTo)
    }
  }, [user, loading, router, finalRedirectTo])

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
} 