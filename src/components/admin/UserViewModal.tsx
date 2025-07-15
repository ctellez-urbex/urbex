'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Mail, Phone, Calendar, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { AdminUser, getAdminUserById } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateOnly, formatDateTime } from '@/lib/utils'

interface UserViewModalProps {
  user: AdminUser
  onClose: () => void
}

export function UserViewModal({ user, onClose }: UserViewModalProps) {
  const [currentUser] = useState<AdminUser>(user)

  // Function to capitalize names (first letter uppercase, rest lowercase)
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const getStatusBadge = (enabled: boolean) => {
    const statusConfig = {
      ENABLED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle, text: 'Activo' },
      DISABLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle, text: 'Inactivo' },
    }
    
    const config = statusConfig[enabled === true ? 'ENABLED' : 'DISABLED'] || statusConfig.ENABLED
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {enabled ? '✓' : '✗'} {config.text}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      Mensual: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Plan Mensual' },
      Anual: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Plan Anual' },
      Semanal: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', text: 'Plan Semanal' }
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            <>
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {capitalizeName(currentUser.first_name)} {capitalizeName(currentUser.last_name)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(currentUser.enabled)}
                    {getPlanBadge(currentUser.plan || '')}
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
                    
                    {currentUser.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.phone_number}</p>
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
                          {formatDateOnly(currentUser.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Último Acceso</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {currentUser.lastLogin 
                            ? formatDateTime(currentUser.lastLogin)
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
                        {currentUser.enabled === true ? '✓' : currentUser.enabled === false ? '✗' : '?'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.enabled === true ? 'Activo' : 'Deshabilitado'}
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
                        {currentUser.user_id ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {currentUser.user_id ? 'Válido' : 'Inválido'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                          </>
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