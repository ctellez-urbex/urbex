#!/usr/bin/env node

/**
 * Test script to verify AWS SDK v3 migration
 * Tests all endpoints to ensure they work correctly
 */

const BASE_URL = 'http://localhost:3000'

async function testEndpoint(name, method, path, body = null) {
  console.log(`🧪 Testing ${name}...`)
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options)
    const data = await response.json()
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Success: ${response.ok ? '✅' : '❌'}`)
    
    if (!response.ok) {
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    } else {
      console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`)
    }
    
    return response.ok
  } catch (error) {
    console.log(`   Error: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 Testing AWS SDK v3 Migration\n')
  
  const tests = [
    {
      name: 'List Users (POST)',
      method: 'POST',
      path: '/api/admin/users',
      body: {
        filters: { search: '', status: 'all', plan: 'all' },
        pagination: { page: 1, limit: 10, total: 0 }
      }
    },
    {
      name: 'Get User by ID (GET)',
      method: 'GET',
      path: '/api/admin/users/test@example.com'
    },
    {
      name: 'Disable User (POST)',
      method: 'POST',
      path: '/api/admin/disable-user',
      body: { email: 'test@example.com' }
    },
    {
      name: 'User Pool Config (GET)',
      method: 'GET',
      path: '/api/debug/user-pool-config'
    },
    {
      name: 'User Attributes (GET)',
      method: 'GET',
      path: '/api/user/attributes'
    },
    {
      name: 'Forgot Password (POST)',
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: 'test@example.com' }
    }
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.method, test.path, test.body)
    if (success) passed++
    console.log('') // Empty line for readability
  }
  
  console.log('📊 Test Results:')
  console.log(`   Passed: ${passed}/${total}`)
  console.log(`   Success Rate: ${Math.round((passed/total) * 100)}%`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! AWS SDK v3 migration successful!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
  }
}

// Run the tests
runTests().catch(console.error) 