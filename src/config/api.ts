/**
 * Base API Configuration
 * 
 * Core configuration and request function for external APIs
 * Compatible with S3 + CloudFront (static content)
 */

// Helper function to get environment variables from static file
function getStaticEnvVar(key: string, fallback: string = ''): string {
  // Try to get from window.ENV (static file) - for production
  if (typeof window !== 'undefined' && window.ENV) {
    if (window.ENV[key]) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Env var ${key} loaded from window.ENV`);
      }
      return window.ENV[key];
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Env var ${key} not found in window.ENV, available keys:`, Object.keys(window.ENV));
    }
  }
  
  // Fallback to process.env (for development/SSR)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Env var ${key} loaded from process.env`);
    }
    return process.env[key];
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ Env var ${key} not found, using fallback`);
  }
  
  return fallback;
}

// Helper function to check if API is configured
function isApiConfigured(): boolean {
  const apiUrl = getStaticEnvVar('NEXT_PUBLIC_API_BASE_URL');
  const apiKey = getStaticEnvVar('NEXT_PUBLIC_API_KEY');
  
  return !!(apiUrl && apiKey && 
           !apiUrl.includes('your_') && !apiUrl.includes('tu_') &&
           !apiKey.includes('your_') && !apiKey.includes('tu_'));
}

export const API_CONFIG = {
  // Base URL for external API
  BASE_URL: getStaticEnvVar('NEXT_PUBLIC_API_BASE_URL', ''),
  API_KEY: getStaticEnvVar('NEXT_PUBLIC_API_KEY', ''),
  
  // Properties API Base URL
  PROPERTIES_BASE_URL: getStaticEnvVar('NEXT_PUBLIC_PROPERTIES_API_BASE_URL', ''),
  PROPERTIES_API_KEY: getStaticEnvVar('NEXT_PUBLIC_PROPERTIES_API_KEY', ''),

  PROPERTIES_DETAIL_BASE_URL: getStaticEnvVar('NEXT_PUBLIC_PROPERTIES_DETAIL_BASE_URL', ''),
  
  // Local Properties API Base URL
  NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL: getStaticEnvVar('NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL', 'http://127.0.0.1:8000'),
  
} as const;

/**
 * Core API request function
 * 
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns Promise with the response
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.API_KEY,
      ...options.headers
    },
    ...options
  };
  
  // Ensure API key is present
  const headers = config.headers as Record<string, string>;
  if (!headers?.['x-api-key']) {
    config.headers = {
      ...config.headers,
      'x-api-key': API_CONFIG.API_KEY
    };
  }
  
  console.log('🌐 API Request:', {
    url,
    method: config.method || 'POST',
    headers: config.headers,
    body: config.body ? JSON.parse(config.body as string) : undefined,
    apiKeyConfigured: !!API_CONFIG.API_KEY,
    apiKeyLength: API_CONFIG.API_KEY?.length || 0,
    baseUrl: API_CONFIG.BASE_URL
  });
  
  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // First, get the response text
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ JSON Parse Error:', jsonError);
      console.error('❌ Response was not JSON. Received:', responseText.substring(0, 500) + '...');
      
      if (responseText.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON - check API endpoint');
      } else {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    }
    
    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ API Success Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Error:', {
      url,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    throw error;
  }
}
