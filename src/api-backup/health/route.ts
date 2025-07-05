import { NextResponse } from 'next/server';
import { createSuccessResponse, logApiRequest, logApiResponse } from '../../lib/api-utils';

/**
 * Health Check Endpoint
 * 
 * Este endpoint no requiere autenticación por API key
 * y se usa para verificar el estado del servidor.
 */

export async function GET(request: Request) {
  // Log API request for debugging
  logApiRequest(request as any, 'Health Check');
  
  // Health check data
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      api: 'operational',
      database: 'operational',
      email: process.env.MAILGUN_API_KEY ? 'configured' : 'not_configured',
      cognito: process.env.AWS_USER_POOL_ID ? 'configured' : 'not_configured'
    }
  };
  
  const response = createSuccessResponse(healthData, 'Servidor funcionando correctamente');
  logApiResponse(response, 'Health Check');
  
  return response;
}

export async function POST(request: Request) {
  // Log API request for debugging
  logApiRequest(request as any, 'Health Check - POST');
  
  try {
    const body = await request.json();
    
    // Echo back the request body for testing
    const echoData = {
      received: body,
      timestamp: new Date().toISOString(),
      method: 'POST'
    };
    
    const response = createSuccessResponse(echoData, 'Echo response');
    logApiResponse(response, 'Health Check - POST');
    
    return response;
  } catch (error) {
    const response = createSuccessResponse(
      { error: 'Invalid JSON body' },
      'Error processing request body',
      400
    );
    logApiResponse(response, 'Health Check - POST Error');
    
    return response;
  }
} 