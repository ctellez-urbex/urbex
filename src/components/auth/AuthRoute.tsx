'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render anything if user is already authenticated
  if (user) {
    return null
  }

  return <>{children}</>
} 