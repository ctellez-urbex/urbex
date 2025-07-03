'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Mail, Phone, Calendar, CreditCard, Clock, CheckCircle, XCircle, MoreHorizontal, RefreshCw } from 'lucide-react'
import { User as UserType } from '@/lib/cognito-admin'

interface UserViewModalProps {
  user: UserType
  onClose: () => void
}

export function UserViewModal({ user, onClose }: UserViewModalProps) {
  const [currentUser, setCurrentUser] = useState<UserType>(user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Function to capitalize names (first letter uppercase, rest lowercase)
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  // Fetch latest user data
  const fetchUserData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Use the specific user API endpoint
      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      if (data.success && data.user) {
        setCurrentUser(data.user)
      } else {
        setError('Usuario no encontrado')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar datos del usuario')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchUserData()
  }, [user.id])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle, text: 'Activo' },
      inactive: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle, text: 'Inactivo' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: MoreHorizontal, text: 'Deshabilitado' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      Mensual: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Plan Mensual' },
      Anual: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Plan Anual' },
      Gratis: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', text: 'Plan Gratis' }
    }
    
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.Mensual
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalles del Usuario
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Información completa del usuario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUserData}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos...</span>
            </div>
          ) : (
            <>
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {capitalizeName(currentUser.firstName)} {capitalizeName(currentUser.lastName)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(currentUser.status)}
                    {getPlanBadge(currentUser.plan)}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Información de Contacto
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.email}</p>
                      </div>
                    </div>
                    
                    {currentUser.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Información de la Cuenta
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(currentUser.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Último Acceso</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {currentUser.lastLogin 
                            ? new Date(currentUser.lastLogin).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nunca ha accedido'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                    Estado de la Cuenta
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentUser.status === 'active' ? '✓' : currentUser.status === 'disabled' ? '✗' : '?'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.status === 'active' ? 'Activo' : currentUser.status === 'disabled' ? 'Deshabilitado' : 'Pendiente'}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentUser.plan === 'Mensual' ? 'M' : currentUser.plan === 'Anual' ? 'A' : 'S'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.plan === 'Mensual' ? 'Mensual' : currentUser.plan === 'Anual' ? 'Anual' : 'Semanal'}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentUser.id ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.id ? 'Válido' : 'Inválido'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
} 