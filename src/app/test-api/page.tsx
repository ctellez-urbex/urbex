"use client";

import { useState } from 'react';

export default function TestAPIPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCognito = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test-cognito');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testForgotPassword = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/index.html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testCognito}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Cognito Connection'}
          </button>
        </div>
        
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to test forgot password"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={testForgotPassword}
            disabled={loading || !email}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 mt-2"
          >
            {loading ? 'Testing...' : 'Test Forgot Password'}
          </button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 