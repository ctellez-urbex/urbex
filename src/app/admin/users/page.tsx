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
import { 
  getAdminUsers, 
  AdminUser, 
  AdminUserFilters, 
  AdminPagination 
} from '@/config/api'

export default function UsersAdminPage() {
  return (
    <ProtectedRoute>
      <UsersAdminContent />
    </ProtectedRoute>
  )
}

function UsersAdminContent() {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<AdminUserFilters>({
    search: '',
    status: 'all',
    plan: 'all'
  })
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    limit: 10,
    total: 0
  })

  // Fetch all users from external API
  const fetchUsers = async () => {    
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminUsers(filters, user?.token)
      
      if (result.success && result.data) {
        const users = result.data.users || result.data
        setAllUsers(users)
        setPagination(prev => ({ ...prev, total: users.length }))
      } else {
        console.error('Error fetching users:', result.error)
        setError(result.error || 'Error desconocido al obtener usuarios')
        setAllUsers([])
        setPagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error de conexión al obtener usuarios')
      setAllUsers([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const handleFilterChange = (newFilters: AdminUserFilters) => {
    // Normalizar filtros: convertir cadenas vacías a undefined para traer todos los usuarios
    const normalizedFilters = {
      search: newFilters.search?.trim() || undefined,
      status: newFilters.status === 'all' ? undefined : newFilters.status,
      plan: newFilters.plan === 'all' ? undefined : newFilters.plan
    }
    
    setFilters(normalizedFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }


  const handleUserCreated = () => {
    fetchUsers() // Refresh the user list
  }
  const { signOut, refreshUserData } = useAuth()

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al cargar usuarios
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/20"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <UserStats users={allUsers} />

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
            users={allUsers}
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