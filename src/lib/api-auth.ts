import { NextRequest } from 'next/server';

/**
 * Environment variables for API keys
 */
export const API_KEY_ENV_VARS = {
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || '',
  PUBLIC_API_KEY: process.env.PUBLIC_API_KEY || ''
} as const;

/**
 * API key validation result interface
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates API key from request headers against environment variables
 * 
 * @param request - Next.js request object
 * @param apiKeyType - Type of API key to validate (API_KEY, ADMIN_API_KEY, PUBLIC_API_KEY)
 * @returns Validation result with success status and optional error message
 */
export function validateApiKeyFromEnv(
  request: NextRequest, 
  apiKeyType: keyof typeof API_KEY_ENV_VARS
): ApiKeyValidationResult {
  // Get the expected API key from environment variables
  const expectedApiKey = API_KEY_ENV_VARS[apiKeyType];
  
  // Check if API key is configured
  if (!expectedApiKey) {
    return {
      isValid: false,
      error: `API key not configured for type: ${apiKeyType}`
    };
  }
  
  // Get API key from request headers
  const providedApiKey = request.headers.get('x-api-key') || 
                        request.headers.get('authorization')?.replace('Bearer ', '') ||
                        request.nextUrl.searchParams.get('api_key');
  
  // Check if API key was provided
  if (!providedApiKey) {
    return {
      isValid: false,
      error: 'API key is required. Please provide it in x-api-key header, Authorization header, or api_key query parameter.'
    };
  }
  
  // Validate API key
  if (providedApiKey !== expectedApiKey) {
    return {
      isValid: false,
      error: 'Invalid API key provided'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates API key from request headers (legacy function for backward compatibility)
 * 
 * @param request - Next.js request object
 * @returns Validation result with success status and optional error message
 */
export function validateApiKey(request: NextRequest): ApiKeyValidationResult {
  return validateApiKeyFromEnv(request, 'API_KEY');
} 