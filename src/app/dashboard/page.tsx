'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, signOut } = useAuth()

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
          <Button 
            onClick={signOut}
            variant="outline"
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información del Usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Nombre
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {user?.name || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Propiedades
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Administra tus propiedades inmobiliarias
            </p>
            <Button className="w-full">
              Ver Propiedades
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Búsquedas
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Historial de búsquedas realizadas
            </p>
            <Button className="w-full" variant="outline">
              Ver Historial
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Configuración
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Personaliza tu cuenta y preferencias
            </p>
            <Button className="w-full" variant="outline">
              Configurar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 