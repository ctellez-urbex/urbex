export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  status: 'active' | 'inactive' | 'pending' | 'disabled'
  plan: 'monthly' | 'yearly' | 'free'
  createdAt: string
  lastLogin?: string
}

export interface UserFilters {
  search: string
  status: string
  plan: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface UserUpdateData {
  firstName: string
  lastName: string
  phone: string
  status: 'active' | 'inactive' | 'pending' | 'disabled'
  plan: 'monthly' | 'yearly' | 'free'
} 