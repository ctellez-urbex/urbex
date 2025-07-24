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
  stack?: string;
  filters?: AdminUserFilters;
  hasToken?: boolean;
  fullError?: any;
}

export interface AdminUserResponse {
  success: boolean;
  data?: AdminUser;
  error?: string;
  stack?: string;
  email?: string;
  hasToken?: boolean;
  fullError?: any;
}

export interface AdminUserByIdResponse {
  success: boolean;
  data?: AdminUser;
  error?: string;
  stack?: string;
  userId?: string;
  hasToken?: boolean;
  fullError?: any;
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
  stack?: string;
  hasToken?: boolean;
  userId?: string;
  userData?: UpdateUserData;
  statusData?: UpdateUserStatusData;
  fullError?: any;
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const requestBody: any = {};
    if (filters.search && filters.search.trim() !== '') {
      requestBody.filter = filters.search.trim();
    }
    if (filters.status && filters.status !== 'all' && filters.status.trim() !== '') {
      requestBody.status = filters.status.trim();
    }
    if (filters.plan && filters.plan !== 'all' && filters.plan.trim() !== '') {
      requestBody.plan = filters.plan.trim();
    }

    const url = `/admin/users`;    
    const response = await apiRequest<any>(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get Admin Users API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuarios',
      stack: error instanceof Error ? error.stack : undefined,
      filters: filters,
      hasToken: !!token
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiRequest<any>(`/admin/user/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
    });
    
    return {
      success: true,
      data: response.data || response      
    };
  } catch (error) {
    console.error('Get Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuario',
      stack: error instanceof Error ? error.stack : undefined,
      hasToken: !!token,
      email: email,
      fullError: error
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
): Promise<AdminUserByIdResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiRequest<any>(`/admin/user/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers,
    });
    
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Get Admin User by ID API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener usuario',
      stack: error instanceof Error ? error.stack : undefined,
      hasToken: !!token,
      userId: userId,
      fullError: error
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiRequest<any>(`/admin/user/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    
    return {
      success: true,
      message: response.message  || 'Usuario actualizado correctamente'
    };
  } catch (error) {
    console.error('Update Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar usuario',
      stack: error instanceof Error ? error.stack : undefined,
      userData: userData,
      userId: userId,      
      hasToken: !!token,
      fullError: error
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiRequest<any>(`/admin/user/${encodeURIComponent(userId)}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(statusData)
    });
    
    return {
      success: true,
      message: response.message  || 'Estado del usuario actualizado correctamente'
    };
  } catch (error) {
    console.error('Update Admin User Status API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estado del usuario',
      stack: error instanceof Error ? error.stack : undefined,
      userId: userId,
      statusData: statusData,
      hasToken: !!token,
      fullError: error
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await apiRequest<any>(`/admin/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers,
    });
    
    return response;
  } catch (error) {
    console.error('Delete Admin User API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar usuario',
      stack: error instanceof Error ? error.stack : undefined,
      hasToken: !!token,
      userId: userId,
      fullError: error
    };
  }
} 