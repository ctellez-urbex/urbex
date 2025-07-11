'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Save, User, Mail, Phone, Calendar, CreditCard } from 'lucide-react'
import { AdminUser } from '@/config/api'
import { formatDateOnly } from '@/lib/utils'

interface UserEditModalProps {
  user: AdminUser
  onClose: () => void
  onUpdate: () => void
}

interface UserUpdateData {
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: 'CONFIRMED' | 'DISABLED' | 'PENDING';
  plan?: string;
}

export function UserEditModal({ user, onClose, onUpdate }: UserEditModalProps) {
  const planMap: Record<string, 'Mensual' | 'Anual' | 'Semanal'> = {
    'Mensual': 'Mensual',
    'Anual': 'Anual',
    'Semanal': 'Semanal'
  };
  const initialPlan = planMap[user.plan || ''] || 'Mensual';
  const [formData, setFormData] = useState<UserUpdateData>({
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    status: user.status,
    plan: initialPlan
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Function to capitalize names (first letter uppercase, rest lowercase)
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First update the user attributes (name, phone)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      // Then update the status separately if it changed
      if (formData.status !== user.status) {
        const statusResponse = await fetch(`/api/admin/users/${user.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: formData.status }),
        })

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          throw new Error(errorData.error || 'Failed to update user status')
        }
      }

      // // Note: Plan updates require the custom:plan attribute to be created in Cognito first
      // // For now, we'll skip plan updates until the attribute is created
      // if (formData.plan !== user.plan) {
      //   console.log('Plan change detected, updating via API...')
      //   try {
      //     const planResponse = await fetch(`/api/admin/users/${user.id}/plan`, {
      //       method: 'PUT',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({ plan: formData.plan }),
      //     })

      //     if (!planResponse.ok) {
      //       const errorData = await planResponse.json()
      //       console.warn('Plan update failed:', errorData.error)
      //       // Don't throw error, just log warning since plan might not be configured yet
      //     } else {
      //       console.log('Plan updated successfully')
      //     }
      //   } catch (planError) {
      //     console.warn('Plan update error (attribute might not be configured):', planError)
      //     // Don't throw error, just log warning
      //   }
      // }

      onUpdate()
    } catch (error) {
      console.error('Error updating user:', error)
      setError(error instanceof Error ? error.message : 'Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    const newStatus = formData.status === 'CONFIRMED' ? 'DISABLED' : 'CONFIRMED'
    setFormData(prev => ({ ...prev, status: newStatus }))
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cambiar estado del usuario')
    }
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
                {capitalizeName(user.first_name)} {capitalizeName(user.last_name)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El email no se puede modificar
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Nombre del usuario"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Apellido del usuario"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="+57 300 123 4567"
            />
          </div>

          {/* Status and Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="pending">Pendiente</option>
                  <option value="disabled">Deshabilitado</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStatusToggle}
                  className={`$
                    formData.status === 'active' 
                      ? 'text-green-600 border-green-600 hover:bg-green-50' 
                      : 'text-red-600 border-red-600 hover:bg-red-50'
                  }`}
                >
                  {formData.status === 'CONFIRMED' ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Plan
              </label>
              <select
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
                <option value="free">Semanal</option>                
              </select>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Fecha de registro: {formatDateOnly(user.createdAt)}</span>
            </div>
            {user.lastLogin && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Último acceso: {formatDateOnly(user.lastLogin)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 