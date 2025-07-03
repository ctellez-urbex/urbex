'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { UserList } from '@/components/admin/UserList'
import { UserFilters } from '@/components/admin/UserFilters'
import { UserStats } from '@/components/admin/UserStats'
import { UserCreateModal } from '@/components/admin/UserCreateModal'
import { Button } from '@/components/ui/button'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { User, UserFilters as UserFiltersType, Pagination } from '@/lib/cognito-admin'

export default function UsersAdminPage() {
  return (
    <ProtectedRoute>
      <UsersAdminContent />
    </ProtectedRoute>
  )
}

function UsersAdminContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    status: 'all',
    plan: 'all'
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0
  })

  // Fetch users from API
  const fetchUsers = async () => {    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters, pagination }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(prev => ({ ...prev, total: data.total }))
    } catch (error) {
      console.error('Error fetching users:', error)
      // Show error message to user
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.page])

  const handleFilterChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }


  const handleUserCreated = () => {
    fetchUsers() // Refresh the user list
  }
  const { user, signOut, refreshUserData } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Administración de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona los usuarios registrados en Cognito
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {/* <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button> */}
            <Button 
              onClick={signOut}
              variant="outline"
              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <UserStats users={users} />

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <UserFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <UserList
            users={users}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onUserUpdate={fetchUsers}
          />
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <UserCreateModal
            onClose={() => setShowCreateModal(false)}
            onUserCreated={handleUserCreated}
          />
        )}
      </div>
    </div>
  )
} 