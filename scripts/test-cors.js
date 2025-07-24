#!/usr/bin/env node

/**
 * CORS Test Script
 * 
 * Tests API connectivity and CORS configuration
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1';
const FRONTEND_ORIGIN = 'https://d2i14zgn3xm1xu.cloudfront.net';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'test-key',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testCORS() {
  console.log('🔍 Testing CORS Configuration...\n');

  const tests = [
    {
      name: 'OPTIONS Preflight Request',
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-api-key,Authorization'
      }
    },
    {
      name: 'GET Request with Origin',
      method: 'GET',
      headers: {
        'Origin': FRONTEND_ORIGIN
      }
    },
    {
      name: 'POST Request with Origin',
      method: 'POST',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    }
  ];

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   URL: ${API_BASE_URL}/admin/users`);
    console.log(`   Method: ${test.method}`);
    
    try {
      const response = await makeRequest(`${API_BASE_URL}/admin/users`, {
        method: test.method,
        headers: test.headers,
        body: test.body
      });

      console.log(`   Status: ${response.statusCode}`);
      
      // Check CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];

      console.log('   CORS Headers:');
      corsHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) {
          console.log(`     ✅ ${header}: ${value}`);
        } else {
          console.log(`     ❌ ${header}: Missing`);
        }
      });

      if (response.body) {
        console.log(`   Response Body: ${response.body.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  const endpoints = [
    { path: '/health', method: 'GET', name: 'Health Check' },
    { path: '/admin/users', method: 'GET', name: 'Admin Users' },
    { path: '/contact/', method: 'POST', name: 'Contact Form', body: JSON.stringify({ test: true }) }
  ];

  for (const endpoint of endpoints) {
    console.log(`📋 Testing: ${endpoint.name}`);
    console.log(`   URL: ${API_BASE_URL}${endpoint.path}`);
    
    try {
      const response = await makeRequest(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        body: endpoint.body
      });

      console.log(`   Status: ${response.statusCode}`);
      
      if (response.body) {
        console.log(`   Response: ${response.body.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  console.log('🚀 Urbex API CORS Test\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Frontend Origin: ${FRONTEND_ORIGIN}\n`);

  await testCORS();
  await testAPIEndpoints();

  console.log('✅ Test completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCORS, testAPIEndpoints }; 