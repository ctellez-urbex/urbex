/**
 * Admin API Configuration
 * 
 * Handles all admin-related API calls including:
 * - User management (list, create, update, delete)
 * - User status management
 * - User attribute updates
 */

import { apiRequest, API_CONFIG } from './api';

// Types for admin functionality
export interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: 'ENABLED' | 'DISABLED';
  status_text: string;
  plan?: string;
  createdAt: string;
  lastLogin?: string;
  su?: string;
  enabled: boolean;
}

export interface AdminUserFilters {
  search?: string;
  status?: string;
  plan?: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total?: number;
}

export interface AdminUsersResponse {
  success: boolean;
  data?: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface AdminUserResponse {
  success: boolean;
  data?: AdminUser;
  error?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  plan?: string;
}

export interface UpdateUserStatusData {
  status: 'ENABLED' | 'DISABLED';
}

export interface UpdateUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get all admin users with filters and pagination
 * 
 * @param filters - Filter options
 * @param token - Authentication token
 * @returns Promise with users list
 */
export async function getAdminUsers(
  filters: AdminUserFilters = {}, 
  token?: string
): Promise<AdminUsersResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.plan) queryParams.append('plan', filters.plan);

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiRequest<AdminUsersResponse>(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Get Admin Users API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuarios'
    };
  }
}

/**
 * Get admin user by email
 * 
 * @param email - User email
 * @param token - Authentication token
 * @returns Promise with user data
 */
export async function getAdminUser(
  email: string, 
  token?: string
): Promise<AdminUserResponse> {
  try {
    const response = await apiRequest<AdminUserResponse>(`/admin/user/email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Get Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuario'
    };
  }
}

/**
 * Get admin user by ID
 * 
 * @param userId - User ID
 * @param token - Authentication token
 * @returns Promise with user data
 */
export async function getAdminUserById(
  userId: string, 
  token?: string
): Promise<AdminUserResponse> {
  try {
    const response = await apiRequest<AdminUserResponse>(`/admin/user?id=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Get Admin User by ID API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuario'
    };
  }
}

/**
 * Update admin user data
 * 
 * @param userId - User ID
 * @param userData - User data to update
 * @param token - Authentication token
 * @returns Promise with update response
 */
export async function updateAdminUser(
  userId: string,
  userData: UpdateUserData,
  token?: string
): Promise<UpdateUserResponse> {
  try {
    const response = await apiRequest<UpdateUserResponse>(`/admin/user?id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    return response;
  } catch (error) {
    console.error('Update Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar usuario'
    };
  }
}

/**
 * Update admin user status
 * 
 * @param userId - User ID
 * @param statusData - Status data to update
 * @param token - Authentication token
 * @returns Promise with update response
 */
export async function updateAdminUserStatus(
  userId: string,
  statusData: UpdateUserStatusData,
  token?: string
): Promise<UpdateUserResponse> {
  try {
    const response = await apiRequest<UpdateUserResponse>(`/admin/user?id=${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });
    
    return response;
  } catch (error) {
    console.error('Update Admin User Status API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado del usuario'
    };
  }
}

/**
 * Delete admin user
 * 
 * @param userId - User ID
 * @param token - Authentication token
 * @returns Promise with delete response
 */
export async function deleteAdminUser(
  userId: string,
  token?: string
): Promise<UpdateUserResponse> {
  try {
    const response = await apiRequest<UpdateUserResponse>(`/admin/user?id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Delete Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar usuario'
    };
  }
} 