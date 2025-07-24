/**
 * Health API Configuration
 * 
 * Handles health checks and connectivity tests
 */

import { apiRequest } from './api';

/**
 * Health check function
 * 
 * @returns Promise with the health check response
 */
export async function healthCheck() {
  return apiRequest('/health');
}

/**
 * Test API connection and configuration
 * 
 * @returns Promise with connection test information
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  error?: string;
  details: {
    baseUrl: string;
    apiKeyConfigured: boolean;
    apiKeyLength: number;
    connectivity: boolean;
    response?: any;
  };
}> {
  try {
    console.log('🔍 Testing API connection...');
    
    // Get API configuration from the main api.ts file
    const { API_CONFIG } = await import('./api');
    
    const details: {
      baseUrl: string;
      apiKeyConfigured: boolean;
      apiKeyLength: number;
      connectivity: boolean;
      response?: any;
    } = {
      baseUrl: API_CONFIG.BASE_URL,
      apiKeyConfigured: !!API_CONFIG.API_KEY,
      apiKeyLength: API_CONFIG.API_KEY?.length || 0,
      connectivity: false
    };
    
    // Test basic connectivity
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'HEAD',
      headers: {
        'x-api-key': API_CONFIG.API_KEY
      }
    });
    
    details.connectivity = response.ok || response.status !== 0;
    details.response = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    console.log('✅ API connection test result:', details);
    
    return {
      success: details.connectivity,
      details
    };
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      details: {
        baseUrl: 'unknown',
        apiKeyConfigured: false,
        apiKeyLength: 0,
        connectivity: false
      }
    };
  }
} 