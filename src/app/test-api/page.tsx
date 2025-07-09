"use client";

import { useState } from 'react';
import { loginUser, healthCheck, sendContactForm } from '@/config/api';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await healthCheck();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await loginUser({
        email: 'carloss.tellezz@gmail.com',
        password: 'C4nc3rb3r0**'
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const testContactForm = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await sendContactForm({
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        message: 'This is a test message'
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Test API Endpoints
          </h1>
        </div>

        <div className="space-y-4">
          <button
            onClick={testHealthCheck}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Health Check'}
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login API'}
          </button>

          <button
            onClick={testContactForm}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Contact Form'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error:</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-sm font-medium text-green-800">Result:</h3>
            <pre className="mt-1 text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">API Configuration:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Base URL:</strong> {typeof window !== 'undefined' && window.ENV?.NEXT_PUBLIC_API_BASE_URL}</p>
            <p><strong>API Key:</strong> {typeof window !== 'undefined' && window.ENV?.NEXT_PUBLIC_API_KEY ? 'Configured' : 'Not configured'}</p>
            <p><strong>Environment:</strong> {typeof window !== 'undefined' && window.ENV?.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 