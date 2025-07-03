'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/aws/cognito'

// Types
interface User {
  email: string
  name?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  su?: string
  plan?: string
  token: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string, plan: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
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
      console.log('🔍 Checking existing session...');
      const session = await authService.getCurrentSession()
      console.log('🔍 Session result:', session);
      
      if (session.success && session.token) {
        // Get user info from Cognito using backend API
        console.log('🔍 Getting user attributes from backend API...');
        
        // First get basic user info to get the email
        const basicUserResult = await authService.getUserAttributes();
        const email = basicUserResult.attributes?.email;
        
        if (!email) {
          console.log('❌ No email available for getting attributes');
          return;
        }
        
        const response = await fetch(`/api/user/attributes?email=${encodeURIComponent(email)}`);
        const userResult = await response.json();
        console.log('🔍 User attributes result:', userResult);
        
        if (userResult.success && userResult.attributes) {
          console.log('🔍 Processing user attributes:', userResult.attributes);
          const userInfo = {
            email: userResult.attributes.email,
            name: `${userResult.attributes.given_name} ${userResult.attributes.family_name}`.trim() || userResult.attributes.email.split('@')[0],
            first_name: userResult.attributes.given_name.trim(),
            last_name: userResult.attributes.family_name.trim(),
            phone_number: userResult.attributes.phone_number,
            su: userResult.attributes.su,
            plan: userResult.attributes.plan
          }
          console.log('🔍 Final userInfo:', userInfo);
          setUser({ ...userInfo, token: session.token })
          saveUserToStorage(userInfo)
        } else {
          console.log('❌ Failed to get user attributes, using fallback');
          
          // If it's an authentication error, don't use fallback
          if (userResult.error && (userResult.error.includes('Invalid or expired session') || userResult.error.includes('User is not authenticated'))) {
            console.log('❌ Authentication error, clearing session');
            setUser(null)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userInfo')
            }
            return
          }
          
          // Fallback to localStorage if Cognito attributes fail for other reasons
          const userInfo = getUserFromStorage()
          if (userInfo) {
            setUser({ ...userInfo, token: session.token })
          }
        }
      }
    } catch (error) {
      console.log('❌ No existing session found:', error)
      
      // Clear any invalid session data
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo')
      }
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

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string, plan: string) => {
    try {
      const result = await authService.signUp({ email, password, firstName, lastName, phone, plan })
      
      if (result.success) {
        // Redirect to email verification page
        router.push(`/auth/verify-email/index.html?email=${encodeURIComponent(email)}`)
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

  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      
      // First get basic user info to get the email
      const basicResult = await authService.getUserAttributes();
      const email = basicResult.attributes?.email;
      
      if (!email) {
        console.log('❌ No email available for refreshing attributes');
        return;
      }
      
      const response = await fetch(`/api/user/attributes?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      console.log('🔄 Refresh result:', result);
      
      if (result.success && result.attributes) {
        console.log('🔄 Processing refresh attributes:', result.attributes);
        const userInfo = {
          email: result.attributes.email,
          name: `${result.attributes.given_name} ${result.attributes.family_name}`.trim() || result.attributes.email.split('@')[0],
          first_name: result.attributes.given_name.trim(),
          last_name: result.attributes.family_name.trim(),
          phone_number: result.attributes.phone_number,
          su: result.attributes.su,
          plan: result.attributes.plan
        }
        console.log('🔄 Final refresh userInfo:', userInfo);
        
        setUser(prevUser => prevUser ? { ...prevUser, ...userInfo } : null)
        saveUserToStorage(userInfo)
      } else {
        console.log('❌ Failed to refresh user data:', result.error);
        
        // If session is invalid, sign out the user
        if (result.error && (result.error.includes('Invalid or expired session') || result.error.includes('User is not authenticated'))) {
          console.log('🔄 Session invalid, signing out user...');
          await signOut();
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
      
      // If there's an authentication error, sign out the user
      if (error instanceof Error && error.message.includes('User is not authenticated')) {
        console.log('🔄 Authentication error, signing out user...');
        await signOut();
      }
    }
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo<AuthContextType>(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    refreshUserData
  }), [user, loading, signIn, signUp, signOut, refreshUserData])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 