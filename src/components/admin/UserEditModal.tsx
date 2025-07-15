'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Mail, Phone, Calendar, CreditCard, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { 
  AdminUser, 
  updateAdminUser, 
  updateAdminUserStatus,
  UpdateUserData,
  UpdateUserStatusData
} from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'

interface UserEditModalProps {
  user: AdminUser
  onClose: () => void
  onUpdate: () => void
}

export function UserEditModal({ user, onClose, onUpdate }: UserEditModalProps) {
  const { user: authUser } = useAuth()
  const [formData, setFormData] = useState<UpdateUserData>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone_number: user.phone_number || '',
    plan: user.plan || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Function to capitalize names (first letter uppercase, rest lowercase)
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔄 Actualizando usuario:', user.user_id, formData)
      
      // Verificar que tenemos el token de autenticación
      if (!authUser?.token) {
        throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.')
      }

      // Actualizar datos del usuario
      const updateResult = await updateAdminUser(user.user_id, formData, authUser.token)
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Error al actualizar usuario')
      }

      setSuccess('Usuario actualizado correctamente')
      
      // Llamar a la función de actualización del padre
      onUpdate()
      
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('❌ Error updating user:', error)
      setError(error instanceof Error ? error.message : 'Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    const newStatus: 'CONFIRMED' | 'DISABLED' = user.status === 'CONFIRMED' ? 'DISABLED' : 'CONFIRMED'
    
    try {
      console.log('🔄 Cambiando estado del usuario:', user.user_id, newStatus)
      
      // Verificar que tenemos el token de autenticación
      if (!authUser?.token) {
        throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.')
      }

      const statusData: UpdateUserStatusData = { status: newStatus }
      const statusResult = await updateAdminUserStatus(user.user_id, statusData, authUser.token)
      
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Error al cambiar estado del usuario')
      }

      setSuccess('Estado del usuario actualizado correctamente')
      
      // Llamar a la función de actualización del padre
      onUpdate()
      
    } catch (error) {
      console.error('❌ Error updating user status:', error)
      setError(error instanceof Error ? error.message : 'Error al cambiar estado del usuario')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Activo' },
      DISABLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Inactivo' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pendiente' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
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
                Editar Usuario
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modificar información del usuario
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {capitalizeName(user.first_name)} {capitalizeName(user.last_name)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(user.status)}
                {getPlanBadge(user.plan || '')}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ingrese el apellido"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El email no se puede modificar por ser único
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ingrese el teléfono"
              />
            </div>

            {/* Plan */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan
              </label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar plan</option>
                <option value="Mensual">Plan Mensual</option>
                <option value="Anual">Plan Anual</option>
                <option value="Semanal">Plan Semanal</option>
              </select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado del Usuario
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.status === 'CONFIRMED' ? 'Usuario activo' : 'Usuario inactivo'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleStatusToggle}
                className="flex items-center gap-2"
              >
                {user.status === 'CONFIRMED' ? (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    Activar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 