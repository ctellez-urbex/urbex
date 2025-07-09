'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Building, Search, Settings, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, refreshUserData } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  console.log('🔍 Dashboard - Current user state:', user)

  // Load fresh user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.token) {
        console.log('🔄 Loading fresh user data on dashboard mount...')
        try {
          await refreshUserData()
        } catch (error) {
          console.error('❌ Error loading user data on mount:', error)
        }
      }
    }

    loadUserData()
  }, [user?.token, refreshUserData])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshUserData()
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
      alert('Error al actualizar los datos del usuario. Por favor, inicia sesión nuevamente.')
    } finally {
      setRefreshing(false)
    }
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Bienvenido/a, {user?.name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información del Usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.email || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Nombre
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.first_name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Apellido
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.last_name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Teléfono
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.phone_number || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Plan
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.plan || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.su && parseInt(user?.su) > 1 && (
          <Link href="/admin/users/index.html" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Administración
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Gestiona usuarios registrados
              </p>
              <Button className="w-full">
                Gestionar Usuarios
              </Button>
            </div>
          </Link>
          )}
          {/*<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Building className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Propiedades
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Administra tus propiedades inmobiliarias
            </p>
            <Button className="w-full">
              Ver Propiedades
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Search className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Búsquedas
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Historial de búsquedas realizadas
            </p>
            <Button className="w-full" variant="outline">
              Ver Historial
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Personaliza tu cuenta y preferencias
            </p>
            <Button className="w-full" variant="outline">
              Configurar
            </Button>
          </div>
          */}
        </div>
      </div>
    </div>
  )
} 