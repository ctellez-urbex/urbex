'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash, X, User } from 'lucide-react'
import { AdminUser, deleteAdminUser } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'

interface UserDeleteModalProps {
  user: AdminUser
  onClose: () => void
  onDelete: () => void
}

/**
 * Modal component for confirming and executing user deletion
 * 
 * This component provides a confirmation dialog for deleting users,
 * with proper error handling and loading states. It integrates with
 * the external API to perform the actual deletion.
 * 
 * @param user - The user object to be deleted
 * @param onClose - Callback function to close the modal
 * @param onDelete - Callback function called after successful deletion
 */
export function UserDeleteModal({ user: userToDelete, onClose, onDelete }: UserDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user: authUser } = useAuth()

  /**
   * Handles the user deletion process
   * 
   * Calls the external API to delete the user and manages
   * loading states and error handling
   */
  const handleDelete = async () => {
    if (!userToDelete.user_id) {
      setError('ID de usuario no válido')
      return
    }

    if (!authUser?.token) {
      setError('Token de autenticación no disponible')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      console.log('🗑️ Starting user deletion process:', {
        userId: userToDelete.user_id,
        userEmail: userToDelete.email,
        hasToken: !!authUser?.token
      })

      const response = await deleteAdminUser(userToDelete.user_id, authUser.token)

      if (response.success) {
        console.log('✅ User deleted successfully:', response.message)
        onDelete()
        onClose()
      } else {
        console.error('❌ User deletion failed:', response.error)
        setError(response.error || 'Error al eliminar el usuario')
      }
    } catch (error) {
      console.error('❌ User deletion error:', error)
      setError(error instanceof Error ? error.message : 'Error inesperado al eliminar el usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Capitalizes the first letter of a name
   * 
   * @param name - The name to capitalize
   * @returns The capitalized name
   */
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Eliminar Usuario
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 h-12 w-12">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
                             <div>
                 <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                   {capitalizeName(userToDelete.first_name)} {capitalizeName(userToDelete.last_name)}
                 </h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                   {userToDelete.email}
                 </p>
                 <p className="text-xs text-gray-400 dark:text-gray-500">
                   ID: {userToDelete.user_id}
                 </p>
               </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    ¿Estás seguro de que quieres eliminar este usuario?
                  </h4>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Se eliminarán todos los datos del usuario</li>
                      <li>Esta acción no se puede deshacer</li>
                      <li>El usuario perderá acceso inmediatamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar Usuario
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 