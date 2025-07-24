'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, getUserProfile, LoginResponse } from '@/config/api-auth'

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

interface StoredUser extends Omit<User, 'token'> {
  token: string;
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
      
      // Check if we have a stored token
      const storedUser = getUserFromStorage();
      if (storedUser && storedUser.token) {
        console.log('🔍 Found stored user session');
        
        // Try to get fresh user data from API
        try {
          const profileResult = await getUserProfile(storedUser.token);
          if (profileResult.success && profileResult.data) {
            console.log('🔍 Got fresh user data from API');
            const freshUserData = {
              email: profileResult.data.email,
              name: profileResult.data.name || profileResult.data.email.split('@')[0],
              first_name: profileResult.data.first_name,
              last_name: profileResult.data.last_name,
              phone_number: profileResult.data.phone_number,
              su: profileResult.data.su,
              plan: profileResult.data.plan,
              token: storedUser.token
            };
            console.log('🔍 Setting fresh user data:', freshUserData);
            setUser(freshUserData);
            saveUserToStorage(freshUserData);
          } else {
            console.log('❌ Failed to get fresh user data, using stored data');
            setUser(storedUser);
          }
        } catch (error) {
          console.log('❌ Error getting fresh user data, using stored data');
          setUser(storedUser);
        }
      } else {
        console.log('❌ No stored session found');
        setUser(null);
      }
    } catch (error) {
      console.log('❌ Error checking session:', error);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
    } finally {
      setLoading(false);
    }
  }

  const getUserFromStorage = (): StoredUser | null => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo')
      return userInfo ? JSON.parse(userInfo) : null
    }
    return null
  }

  const saveUserToStorage = (userInfo: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔵 SignIn called with:', email)
    
    try {
      const result = await loginUser({ email, password })
      console.log('🔵 Login API result:', result)
      
      if (result.success && result.data) {
        const userInfo = {
          email: result.data.user.email,
          name: result.data.user.name || result.data.user.email.split('@')[0],
          first_name: result.data.user.first_name,
          last_name: result.data.user.last_name,
          phone_number: result.data.user.phone_number,
          su: result.data.user.su,
          plan: result.data.user.plan,
          token: result.data.token
        }
        console.log('🔵 Setting user:', userInfo)
        
        setUser(userInfo)
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
      // For now, redirect to registration page - API integration can be added later
      router.push(`/auth/register?email=${encodeURIComponent(email)}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Error durante el registro' }
    }
  }

  const signOut = async () => {
    try {
      // Clear user data
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo')
      }
      router.push('/')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      
      if (user && user.token) {
        const profileResult = await getUserProfile(user.token);
        console.log('🔄 Refresh result:', profileResult);
        
        if (profileResult.success && profileResult.data) {
          console.log('🔄 Processing refresh data:', profileResult.data);
          const userInfo = {
            email: profileResult.data.email,
            name: profileResult.data.name || profileResult.data.email.split('@')[0],
            first_name: profileResult.data.first_name,
            last_name: profileResult.data.last_name,
            phone_number: profileResult.data.phone_number,
            su: profileResult.data.su,
            plan: profileResult.data.plan,
            token: user.token
          }
          console.log('🔄 Final refresh userInfo:', userInfo);
          
          setUser(userInfo);
          saveUserToStorage(userInfo);
        } else {
          console.log('❌ Failed to refresh user data:', profileResult.error);
          
          // If session is invalid, sign out the user
          if (profileResult.error && (profileResult.error.includes('Invalid or expired session') || profileResult.error.includes('User is not authenticated'))) {
            console.log('🔄 Session invalid, signing out user...');
            await signOut();
          }
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