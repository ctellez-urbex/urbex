#!/usr/bin/env node

/**
 * Test script for user API endpoints
 * Tests both the list users and individual user endpoints
 */

const BASE_URL = 'http://localhost:3000'

async function testUserAPI() {
  console.log('🧪 Testing User API Endpoints\n')
  
  try {
    // Test 1: List users with short search term
    console.log('📋 Test 1: List users with short search term')
    const shortSearchResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: { search: 'test', status: 'all', plan: 'all' },
        pagination: { page: 1, limit: 10, total: 0 }
      })
    })
    
    console.log('Status:', shortSearchResponse.status)
    const shortSearchData = await shortSearchResponse.json()
    console.log('Response:', JSON.stringify(shortSearchData, null, 2))
    console.log('✅ Short search test completed\n')
    
    // Test 2: List users with long search term (should be truncated)
    console.log('📋 Test 2: List users with long search term')
    const longEmail = 'very.long.email.address.that.exceeds.the.limit.for.cognito.filters@example.com'
    const longSearchResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: { search: longEmail, status: 'all', plan: 'all' },
        pagination: { page: 1, limit: 10, total: 0 }
      })
    })
    
    console.log('Status:', longSearchResponse.status)
    const longSearchData = await longSearchResponse.json()
    console.log('Response:', JSON.stringify(longSearchData, null, 2))
    console.log('✅ Long search test completed\n')
    
    // Test 3: Get individual user (replace with actual email)
    console.log('📋 Test 3: Get individual user')
    const testEmail = 'test@example.com' // Replace with actual email from your system
    const individualUserResponse = await fetch(`${BASE_URL}/api/admin/users/${encodeURIComponent(testEmail)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log('Status:', individualUserResponse.status)
    const individualUserData = await individualUserResponse.json()
    console.log('Response:', JSON.stringify(individualUserData, null, 2))
    console.log('✅ Individual user test completed\n')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
  
  console.log('🎉 All tests completed!')
}

// Run the tests
testUserAPI() 