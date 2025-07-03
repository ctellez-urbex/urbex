'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, MoreHorizontal, CheckCircle, XCircle, User } from 'lucide-react'
import { UserEditModal } from './UserEditModal'
import { UserViewModal } from './UserViewModal'
import { User as UserType, Pagination } from '@/lib/cognito-admin'

interface UserListProps {
  users: UserType[]
  loading: boolean
  pagination: Pagination
  onPageChange: (page: number) => void
  onUserUpdate: () => void
}

export function UserList({ users, loading, pagination, onPageChange, onUserUpdate }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Function to capitalize names (first letter uppercase, rest lowercase)
  const capitalizeName = (name: string): string => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedUser(null)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedUser(null)
  }

  const handleUserUpdated = () => {
    onUserUpdate()
    handleCloseEditModal()
  }

  const getStatusBadge = (status: string, statusText: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: MoreHorizontal },
      disabled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {statusText}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    // Map plan values to display names
    const planDisplayNames: Record<string, string> = {
      'Anual': 'Anual',
      'Mensual': 'Mensual',
      'Semanal': 'Semanal'
    }
    
    const planConfig = {
      Anual: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      Mensual: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400' },
      Semanal: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },      
    }
    
    const displayName = planDisplayNames[plan] || plan
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.Mensual
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {displayName}
      </span>
    )
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
              console.log('User data:', {
                id: user.id,
                email: user.email,
                status: user.status,
                statusText: user.statusText,
                plan: user.plan
              });
              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {capitalizeName(user.firstName)} {capitalizeName(user.lastName)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status, user.statusText)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlanBadge(user.plan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} usuarios
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-700 dark:text-gray-300">
                Página {pagination.page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={handleCloseEditModal}
          onUpdate={handleUserUpdated}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={handleCloseViewModal}
        />
      )}
    </>
  )
} 