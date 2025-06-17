'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/aws/cognito'

// Types
interface User {
  email: string
  name?: string
  token: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  isAuthenticated: boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const session = await authService.getCurrentSession()
      if (session.success && session.token) {
        // Get user info from token or localStorage
        const userInfo = getUserFromStorage()
        if (userInfo) {
          setUser({ ...userInfo, token: session.token })
        }
      }
    } catch (error) {
      console.log('No existing session found')
    } finally {
      setLoading(false)
    }
  }

  const getUserFromStorage = (): Omit<User, 'token'> | null => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo')
      return userInfo ? JSON.parse(userInfo) : null
    }
    return null
  }

  const saveUserToStorage = (userInfo: Omit<User, 'token'>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔵 SignIn called with:', email)
    
    try {
      const result = await authService.signIn({ email, password })
      console.log('🔵 Auth service result:', result)
      
      if (result.success && result.token) {
        const userInfo = { email, name: email.split('@')[0] }
        console.log('🔵 Setting user:', userInfo)
        
        setUser({ ...userInfo, token: result.token })
        saveUserToStorage(userInfo)
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          console.log('🔵 Redirecting to dashboard')
          router.push('/dashboard')
        }, 100)
        
        return { success: true }
      }
      
      console.log('🔴 Login failed:', result.error)
      return { success: false, error: result.error }
    } catch (error) {
      console.error('🔴 SignIn error:', error)
      return { success: false, error: 'Error durante el login' }
    }
  }

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const result = await authService.signUp({ email, password, name, phone })
      
      if (result.success) {
        // Redirect to email verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      return { success: false, error: 'Error durante el registro' }
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
    } catch (error) {
      console.error('Error during sign out:', error)
    } finally {
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo')
      }
      router.push('/')
    }
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo<AuthContextType>(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }), [user, loading, signIn, signUp, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 