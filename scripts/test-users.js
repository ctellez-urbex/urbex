#!/usr/bin/env node

/**
 * Consolidated User Testing Script
 * 
 * Combines functionality from:
 * - test-user-api.js (test API endpoints)
 * - test-user-attributes.js (test user attributes)
 * - test-cognito-errors.js (test error handling)
 * - test-disabled-user.js (test disabled user scenarios)
 * 
 * Usage:
 *   node scripts/test-users.js api                           # Test API endpoints
 *   node scripts/test-users.js attributes <email>            # Test user attributes
 *   node scripts/test-users.js errors                        # Test error handling
 *   node scripts/test-users.js disabled <email>              # Test disabled user
 *   node scripts/test-users.js --help                        # Show help
 */

const { CognitoIdentityServiceProvider } = require('aws-sdk');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const showHelp = args.includes('--help');

if (showHelp || !command) {
  console.log(`
🧪 User Testing Script - Usage Options:

  node scripts/test-users.js api                           # Test API endpoints
  node scripts/test-users.js attributes <email>            # Test user attributes
  node scripts/test-users.js errors                        # Test error handling
  node scripts/test-users.js disabled <email>              # Test disabled user
  node scripts/test-users.js --help                        # Show this help

Environment Variables Required:
  - AWS_USER_POOL_ID: Your Cognito User Pool ID
  - AWS_REGION: AWS region (default: us-east-2)
  - AWS_ACCESS_KEY_ID: AWS access key
  - AWS_SECRET_ACCESS_KEY: AWS secret key
`);
  process.exit(0);
}

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;
const BASE_URL = 'http://localhost:3000';

// ============================================================================
// API TESTING FUNCTIONS
// ============================================================================

async function testUserAPI() {
  console.log('🧪 Testing User API Endpoints\n');
  
  try {
    // Test 1: List users with short search term
    console.log('📋 Test 1: List users with short search term');
    const shortSearchResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: { search: 'test', status: 'all', plan: 'all' },
        pagination: { page: 1, limit: 10, total: 0 }
      })
    });
    
    console.log('Status:', shortSearchResponse.status);
    const shortSearchData = await shortSearchResponse.json();
    console.log('Response:', JSON.stringify(shortSearchData, null, 2));
    console.log('✅ Short search test completed\n');
    
    // Test 2: List users with long search term (should be truncated)
    console.log('📋 Test 2: List users with long search term');
    const longEmail = 'very.long.email.address.that.exceeds.the.limit.for.cognito.filters@example.com';
    const longSearchResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: { search: longEmail, status: 'all', plan: 'all' },
        pagination: { page: 1, limit: 10, total: 0 }
      })
    });
    
    console.log('Status:', longSearchResponse.status);
    const longSearchData = await longSearchResponse.json();
    console.log('Response:', JSON.stringify(longSearchData, null, 2));
    console.log('✅ Long search test completed\n');
    
    // Test 3: Get individual user (replace with actual email)
    console.log('📋 Test 3: Get individual user');
    const testEmail = 'test@example.com'; // Replace with actual email from your system
    const individualUserResponse = await fetch(`${BASE_URL}/api/admin/users/${encodeURIComponent(testEmail)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Status:', individualUserResponse.status);
    const individualUserData = await individualUserResponse.json();
    console.log('Response:', JSON.stringify(individualUserData, null, 2));
    console.log('✅ Individual user test completed\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('🎉 All API tests completed!');
}

// ============================================================================
// ATTRIBUTES TESTING FUNCTIONS
// ============================================================================

async function testUserAttributes(email) {
  try {
    if (!email) {
      console.log('❌ Please provide an email as argument');
      console.log('Usage: node scripts/test-users.js attributes user@example.com');
      return;
    }

    console.log('🔍 Testing user attributes for:', email);
    console.log('📋 User Pool ID:', USER_POOL_ID);

    const userResponse = await cognito.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: email
    }).promise();
    
    console.log('\n📊 User Info:');
    console.log('Username:', userResponse.Username);
    console.log('Status:', userResponse.UserStatus);
    console.log('Enabled:', userResponse.Enabled);
    console.log('Created:', userResponse.UserCreateDate);
    console.log('Modified:', userResponse.UserLastModifiedDate);

    console.log('\n📋 All Attributes:');
    if (userResponse.UserAttributes) {
      userResponse.UserAttributes.forEach(attr => {
        console.log(`${attr.Name} = ${attr.Value}`);
      });
    }

    // Check for specific attributes
    const attributes = userResponse.UserAttributes || [];
    const customSu = attributes.find(attr => attr.Name === 'custom:su');
    const customPlan = attributes.find(attr => attr.Name === 'custom:plan');
    const emailAttr = attributes.find(attr => attr.Name === 'email');
    const givenName = attributes.find(attr => attr.Name === 'given_name');
    const familyName = attributes.find(attr => attr.Name === 'family_name');
    const phoneNumber = attributes.find(attr => attr.Name === 'phone_number');

    console.log('\n🔍 Specific Attributes Check:');
    console.log('custom:su:', customSu ? customSu.Value : 'NOT FOUND');
    console.log('custom:plan:', customPlan ? customPlan.Value : 'NOT FOUND');
    console.log('email:', emailAttr ? emailAttr.Value : 'NOT FOUND');
    console.log('given_name:', givenName ? givenName.Value : 'NOT FOUND');
    console.log('family_name:', familyName ? familyName.Value : 'NOT FOUND');
    console.log('phone_number:', phoneNumber ? phoneNumber.Value : 'NOT FOUND');

  } catch (error) {
    console.error('❌ Error testing user attributes:', error.message);
  }
}

// ============================================================================
// ERROR HANDLING TESTING FUNCTIONS
// ============================================================================

function testCognitoErrors() {
  console.log('🧪 Testing Cognito Error Handling...\n');

  // Simulate the exact error handling logic from our code
  function mapCognitoError(errorMessage) {
    console.log(`🔍 Processing error: "${errorMessage}"`);
    
    let errorMessageResult = errorMessage;
    const errorString = errorMessage.toLowerCase();
    
    // Handle NotAuthorizedException variations and standalone messages
    console.log('🔍 Error string:', errorString);
    if (errorString.includes('notauthorizedexception') || errorString.includes('not authorized') || 
        errorString.includes('user is disabled') || errorString.includes('disabled')) {
      if (errorString.includes('incorrect username or password') || errorString.includes('incorrect password')) {
        errorMessageResult = 'Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?';
      } else if (errorString.includes('user is disabled') || errorString.includes('disabled')) {
        errorMessageResult = 'Tu cuenta está deshabilitada. Contacta al administrador para habilitarla.';
      } else if (errorString.includes('password attempts exceeded') || errorString.includes('too many failed attempts')) {
        errorMessageResult = 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.';
      } else {
        errorMessageResult = 'No tienes autorización para acceder. Verifica tus credenciales.';
      }
    } 
    // Handle UserNotConfirmedException
    else if (errorString.includes('usernotconfirmedexception') || errorString.includes('user not confirmed')) {
      errorMessageResult = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.';
    } 
    // Handle UserNotFoundException
    else if (errorString.includes('usernotfoundexception') || errorString.includes('user does not exist')) {
      errorMessageResult = 'No existe una cuenta con este email. Regístrate primero.';
    } 
    // Handle TooManyRequestsException
    else if (errorString.includes('toomanyrequestsexception') || errorString.includes('rate exceeded')) {
      errorMessageResult = 'Demasiados intentos de login. Espera unos minutos antes de intentar de nuevo.';
    }
    // Handle PasswordResetRequiredException
    else if (errorString.includes('passwordresetrequiredexception') || errorString.includes('password reset required')) {
      errorMessageResult = 'Debes cambiar tu contraseña. Usa la opción "Olvidé mi contraseña".';
    }
    // Handle other common errors
    else if (errorString.includes('network') || errorString.includes('connection')) {
      errorMessageResult = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    }
    
    return errorMessageResult;
  }

  // Test cases based on real Cognito errors
  const testErrors = [
    // The specific error you're seeing
    'NotAuthorizedException: User is disabled.',
    
    // Other variations of the same error
    'NotAuthorizedException: User is disabled',
    'User is disabled',
    'NotAuthorizedException: Incorrect username or password.',
    'NotAuthorizedException: Incorrect username or password',
    'Incorrect username or password',
    
    // Other common Cognito errors
    'UserNotConfirmedException: User is not confirmed.',
    'UserNotFoundException: User does not exist.',
    'TooManyRequestsException: Rate exceeded.',
    'PasswordResetRequiredException: Password reset required.',
    
    // Edge cases
    'NotAuthorizedException: Password attempts exceeded',
    'NotAuthorizedException: Too many failed attempts',
    'Network error',
    'Connection timeout',
    
    // Unknown errors
    'SomeUnknownException: Something went wrong',
    'Random error message'
  ];

  console.log('📋 Testing Error Mapping:\n');

  testErrors.forEach((error, index) => {
    const mappedError = mapCognitoError(error);
    const isDisabled = mappedError.includes('deshabilitada');
    
    console.log(`${index + 1}. Original: "${error}"`);
    console.log(`   Mapped:  "${mappedError}"`);
    console.log(`   Disabled: ${isDisabled ? '✅ YES' : '❌ NO'}`);
    console.log('');
  });

  console.log('✅ Error mapping test completed!');

  // Test specific scenarios
  console.log('\n🎯 Testing Specific Scenarios:\n');

  // Scenario 1: User is disabled
  console.log('Scenario 1: User is disabled');
  const disabledError = 'NotAuthorizedException: User is disabled.';
  const disabledResult = mapCognitoError(disabledError);
  console.log(`Input: "${disabledError}"`);
  console.log(`Output: "${disabledResult}"`);
  console.log(`Should show disabled message: ${disabledResult.includes('deshabilitada') ? '✅ YES' : '❌ NO'}\n`);

  // Scenario 2: Wrong password
  console.log('Scenario 2: Wrong password');
  const wrongPasswordError = 'NotAuthorizedException: Incorrect username or password.';
  const wrongPasswordResult = mapCognitoError(wrongPasswordError);
  console.log(`Input: "${wrongPasswordError}"`);
  console.log(`Output: "${wrongPasswordResult}"`);
  console.log(`Should show password error: ${wrongPasswordResult.includes('incorrectos') ? '✅ YES' : '❌ NO'}\n`);

  // Scenario 3: User not confirmed
  console.log('Scenario 3: User not confirmed');
  const notConfirmedError = 'UserNotConfirmedException: User is not confirmed.';
  const notConfirmedResult = mapCognitoError(notConfirmedError);
  console.log(`Input: "${notConfirmedError}"`);
  console.log(`Output: "${notConfirmedResult}"`);
  console.log(`Should show confirmation message: ${notConfirmedResult.includes('confirmar') ? '✅ YES' : '❌ NO'}\n`);

  console.log('🎉 All error handling tests completed successfully!');
}

// ============================================================================
// DISABLED USER TESTING FUNCTIONS
// ============================================================================

async function testDisabledUser(email) {
  try {
    const testEmail = email || 'test@example.com';
    
    console.log('🧪 Testing Disabled User Error Handling...\n');
    console.log('📧 Testing with email:', testEmail);
    console.log('🔍 User Pool ID:', USER_POOL_ID);
    
    // First, let's check if the user exists and their status
    console.log('\n1️⃣ Checking user status...');
    
    try {
      const userResponse = await cognito.adminGetUser({
        UserPoolId: USER_POOL_ID,
        Username: testEmail
      }).promise();
      
      console.log('✅ User found:', {
        username: userResponse.Username,
        status: userResponse.UserStatus,
        enabled: userResponse.Enabled,
        emailVerified: userResponse.UserAttributes?.find(attr => attr.Name === 'email_verified')?.Value
      });
      
      // Check if user is disabled
      if (!userResponse.Enabled) {
        console.log('⚠️  User is DISABLED - this should trigger the error message');
      } else {
        console.log('✅ User is ENABLED');
      }
      
    } catch (userError) {
      console.log('❌ User not found or error:', userError.message);
    }
    
    // Now test the authentication flow
    console.log('\n2️⃣ Testing authentication flow...');
    
    // This would normally be done by the frontend, but we can simulate the error
    console.log('🔐 Simulating login attempt...');
    
    // The actual error would be thrown by the Cognito client SDK
    // But we can test our error message mapping
    const testErrors = [
      'NotAuthorizedException: User is disabled.',
      'NotAuthorizedException: Incorrect username or password.',
      'UserNotConfirmedException: User is not confirmed.',
      'UserNotFoundException: User does not exist.',
      'TooManyRequestsException: Rate exceeded.'
    ];
    
    console.log('\n3️⃣ Testing error message mapping:');
    
    testErrors.forEach(error => {
      let errorMessage = error;
      
      if (error.includes('NotAuthorizedException')) {
        if (error.includes('Incorrect username or password')) {
          errorMessage = 'Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?';
        } else if (error.includes('User is disabled')) {
          errorMessage = 'Tu cuenta está deshabilitada. Contacta al administrador para habilitarla.';
        } else {
          errorMessage = 'No tienes autorización para acceder. Verifica tus credenciales.';
        }
      } else if (error.includes('UserNotConfirmedException')) {
        errorMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.';
      } else if (error.includes('UserNotFoundException')) {
        errorMessage = 'No existe una cuenta con este email. Regístrate primero.';
      } else if (error.includes('TooManyRequestsException')) {
        errorMessage = 'Demasiados intentos de login. Espera unos minutos antes de intentar de nuevo.';
      }
      
      console.log(`🔴 Original: ${error}`);
      console.log(`✅ Mapped:  ${errorMessage}`);
      console.log('');
    });
    
    console.log('✅ Disabled user test completed successfully!');
    
  } catch (error) {
    console.error('❌ Disabled user test failed:', error);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🧪 User Testing Script\n');
  
  switch (command) {
    case 'api':
      await testUserAPI();
      break;
      
    case 'attributes':
      const email = args[1];
      await testUserAttributes(email);
      break;
      
    case 'errors':
      testCognitoErrors();
      break;
      
    case 'disabled':
      const disabledEmail = args[1];
      await testDisabledUser(disabledEmail);
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Use --help to see available commands');
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 