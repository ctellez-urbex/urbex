'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wifi, 
  WifiOff, 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Info,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react'
import { API_CONFIG, testApiConnection, getAdminUsers } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: any
  timestamp: string
}

export default function TestConnectivityPage() {
  const { user: authUser } = useAuth()
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTest, setCurrentTest] = useState('')

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [result, ...prev])
  }

  const runDiagnostics = async () => {
    setLoading(true)
    setResults([])
    
    console.log('🔍 Starting comprehensive API diagnostics...')
    
    // Test 1: Environment Configuration
    setCurrentTest('Verificando configuración del entorno...')
    addResult({
      name: 'Environment Configuration',
      status: 'info',
      message: 'Checking environment variables and API configuration',
      details: {
        baseUrl: API_CONFIG.BASE_URL,
        hasApiKey: !!API_CONFIG.API_KEY,
        apiKeyLength: API_CONFIG.API_KEY?.length || 0,
        hasAuthUser: !!authUser,
        hasToken: !!authUser?.token,
        tokenLength: authUser?.token?.length || 0
      },
      timestamp: new Date().toISOString()
    })

    // Test 2: Basic Network Connectivity
    setCurrentTest('Probando conectividad de red básica...')
    try {
      const connectivityTest = await testApiConnection()
      addResult({
        name: 'Basic Network Connectivity',
        status: connectivityTest.success ? 'success' : 'error',
        message: connectivityTest.success 
          ? 'Network connectivity is working' 
          : `Network connectivity failed: ${connectivityTest.error}`,
        details: connectivityTest.details,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addResult({
        name: 'Basic Network Connectivity',
        status: 'error',
        message: `Connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        timestamp: new Date().toISOString()
      })
    }

    // Test 3: DNS Resolution
    setCurrentTest('Verificando resolución DNS...')
    try {
      const url = new URL(API_CONFIG.BASE_URL)
      const hostname = url.hostname
      
      // Test DNS resolution by trying to fetch a simple resource
      const dnsTest = await fetch(`${API_CONFIG.BASE_URL}`, {
        method: 'HEAD',
        mode: 'no-cors' // This will work even with CORS issues
      })
      
      addResult({
        name: 'DNS Resolution',
        status: 'success',
        message: `DNS resolution successful for ${hostname}`,
        details: {
          hostname,
          protocol: url.protocol,
          port: url.port || 'default'
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addResult({
        name: 'DNS Resolution',
        status: 'error',
        message: `DNS resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        timestamp: new Date().toISOString()
      })
    }

    // Test 4: CORS Configuration
    setCurrentTest('Verificando configuración CORS...')
    try {
      const corsTest = await fetch(API_CONFIG.BASE_URL, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'x-api-key,authorization,content-type'
        }
      })
      
      addResult({
        name: 'CORS Configuration',
        status: corsTest.ok ? 'success' : 'warning',
        message: corsTest.ok 
          ? 'CORS preflight request successful' 
          : 'CORS preflight request failed, but this might be normal',
        details: {
          status: corsTest.status,
          statusText: corsTest.statusText,
          headers: Object.fromEntries(corsTest.headers.entries())
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addResult({
        name: 'CORS Configuration',
        status: 'warning',
        message: `CORS test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        timestamp: new Date().toISOString()
      })
    }

    // Test 5: API Key Authentication
    setCurrentTest('Verificando autenticación con API Key...')
    try {
      const authTest = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': API_CONFIG.API_KEY,
          'Content-Type': 'application/json'
        }
      })
      
      addResult({
        name: 'API Key Authentication',
        status: authTest.ok ? 'success' : 'error',
        message: authTest.ok 
          ? 'API key authentication successful' 
          : `API key authentication failed: ${authTest.status} ${authTest.statusText}`,
        details: {
          status: authTest.status,
          statusText: authTest.statusText,
          hasApiKey: !!API_CONFIG.API_KEY,
          apiKeyLength: API_CONFIG.API_KEY?.length || 0
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addResult({
        name: 'API Key Authentication',
        status: 'error',
        message: `API key authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        timestamp: new Date().toISOString()
      })
    }

    // Test 6: Bearer Token Authentication (if available)
    if (authUser?.token) {
      setCurrentTest('Verificando autenticación con Bearer Token...')
      try {
        const tokenTest = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'x-api-key': API_CONFIG.API_KEY,
            'Authorization': `Bearer ${authUser.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        addResult({
          name: 'Bearer Token Authentication',
          status: tokenTest.ok ? 'success' : 'error',
          message: tokenTest.ok 
            ? 'Bearer token authentication successful' 
            : `Bearer token authentication failed: ${tokenTest.status} ${tokenTest.statusText}`,
          details: {
            status: tokenTest.status,
            statusText: tokenTest.statusText,
            hasToken: !!authUser.token,
            tokenLength: authUser.token?.length || 0
          },
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        addResult({
          name: 'Bearer Token Authentication',
          status: 'error',
          message: `Bearer token authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { error },
          timestamp: new Date().toISOString()
        })
      }
    } else {
      addResult({
        name: 'Bearer Token Authentication',
        status: 'warning',
        message: 'No Bearer token available for testing',
        details: { reason: 'User not authenticated' },
        timestamp: new Date().toISOString()
      })
    }

    // Test 7: Admin Users Endpoint (if authenticated)
    if (authUser?.token) {
      setCurrentTest('Probando endpoint de usuarios administradores...')
      try {
        const adminTest = await getAdminUsers({}, authUser.token)
        
        addResult({
          name: 'Admin Users Endpoint',
          status: adminTest.success ? 'success' : 'error',
          message: adminTest.success 
            ? 'Admin users endpoint working correctly' 
            : `Admin users endpoint failed: ${adminTest.error}`,
          details: {
            success: adminTest.success,
            error: adminTest.error,
            hasData: !!adminTest.data,
            userCount: adminTest.data?.users?.length || 0
          },
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        addResult({
          name: 'Admin Users Endpoint',
          status: 'error',
          message: `Admin users endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { error },
          timestamp: new Date().toISOString()
        })
      }
    } else {
      addResult({
        name: 'Admin Users Endpoint',
        status: 'warning',
        message: 'Cannot test admin endpoint without authentication',
        details: { reason: 'User not authenticated' },
        timestamp: new Date().toISOString()
      })
    }

    // Test 8: Browser Network Capabilities
    setCurrentTest('Verificando capacidades de red del navegador...')
    try {
      const networkInfo = {
        userAgent: navigator.userAgent,
        onLine: navigator.onLine,
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt
        } : 'Not available',
        platform: navigator.platform,
        language: navigator.language
      }
      
      addResult({
        name: 'Browser Network Capabilities',
        status: 'info',
        message: 'Browser network capabilities checked',
        details: networkInfo,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addResult({
        name: 'Browser Network Capabilities',
        status: 'warning',
        message: `Could not check browser capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        timestamp: new Date().toISOString()
      })
    }

    setLoading(false)
    setCurrentTest('')
    console.log('✅ Diagnostics completed')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.info}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          API Connectivity Diagnostics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive testing tool to diagnose API connectivity issues
        </p>
      </div>

      {/* Configuration Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>
            API configuration and authentication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">API Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Base URL:</span>
                  <span className="font-mono text-gray-900 dark:text-white truncate max-w-xs">
                    {API_CONFIG.BASE_URL}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">API Key:</span>
                  <span className="flex items-center gap-1">
                    {API_CONFIG.API_KEY ? (
                      <>
                        <Lock className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Configured</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Missing</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Authentication</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User Status:</span>
                  <span className={authUser ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {authUser ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bearer Token:</span>
                  <span className={authUser?.token ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {authUser?.token ? 'Available' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Diagnostic Controls
          </CardTitle>
          <CardDescription>
            Run comprehensive connectivity tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {loading ? currentTest : 'Run Diagnostics'}
            </Button>
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {currentTest}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Diagnostic Results
            </CardTitle>
            <CardDescription>
              {results.length} tests completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Based on the diagnostic results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.some(r => r.status === 'error') && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                    Critical Issues Found
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {results.filter(r => r.status === 'error').map((result, index) => (
                      <li key={index}>• {result.name}: {result.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.some(r => r.status === 'warning') && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Warnings
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {results.filter(r => r.status === 'warning').map((result, index) => (
                      <li key={index}>• {result.name}: {result.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.every(r => r.status === 'success' || r.status === 'info') && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                    All Systems Operational
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All connectivity tests passed successfully. Your API configuration appears to be working correctly.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 