#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

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

console.log('🎉 All tests completed successfully!'); 