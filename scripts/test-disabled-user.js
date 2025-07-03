#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { CognitoIdentityServiceProvider } = require('aws-sdk');

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

console.log('🧪 Testing Disabled User Error Handling...\n');

async function testDisabledUser() {
  try {
    // Test email (replace with a real disabled user email)
    const testEmail = process.argv[2] || 'test@example.com';
    
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
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDisabledUser(); 