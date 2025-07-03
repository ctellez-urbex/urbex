#!/usr/bin/env node

/**
 * Test script to verify phone number formatting for AWS Cognito
 * 
 * This script helps test and validate phone number formats
 * that are compatible with AWS Cognito requirements.
 * 
 * Usage:
 * node scripts/test-phone-format.js
 */

// Test phone number formatting function
function formatPhoneForCognito(phone) {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// Test phone number validation function
function validatePhoneNumber(phone) {
  if (!phone.trim()) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Validate Colombia phone numbers (+57 followed by 10 digits)
  if (cleanPhone.startsWith('+57')) {
    const digits = cleanPhone.slice(3);
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      return { 
        isValid: false, 
        error: 'El número de teléfono debe tener 10 dígitos después del código de país (+57)' 
      };
    }
    return { isValid: true, formatted: cleanPhone };
  }
  
  // Validate Mexico phone numbers (+52 followed by 10 digits)
  if (cleanPhone.startsWith('+52')) {
    const digits = cleanPhone.slice(3);
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      return { 
        isValid: false, 
        error: 'El número de teléfono debe tener 10 dígitos después del código de país (+52)' 
      };
    }
    return { isValid: true, formatted: cleanPhone };
  }
  
  // Validate other international formats
  if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Ingresa un número de teléfono válido con código de país (ej: +57 317 890 1234)' 
    };
  }
  
  return { isValid: true, formatted: cleanPhone };
}

// Test cases
const testCases = [
  // Valid Colombia numbers
  '+57 317 890 1234',
  '+573178901234',
  '+57 300 123 4567',
  
  // Valid Mexico numbers
  '+52 55 1234 5678',
  '+525512345678',
  '+52 81 1234 5678',
  
  // Valid international numbers
  '+1 555 123 4567',
  '+44 20 7946 0958',
  '+81 3 1234 5678',
  
  // Invalid numbers
  '+57 123 456', // Too short
  '+57 123 456 789 012', // Too long
  '317 890 1234', // Missing country code
  '+57 abc def ghij', // Contains letters
  '+57 123 456 789a', // Contains letter
];

console.log('🧪 Testing Phone Number Formatting for AWS Cognito\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`);
  
  const validation = validatePhoneNumber(testCase);
  const formatted = formatPhoneForCognito(testCase);
  
  if (validation.isValid) {
    console.log(`✅ Valid: ${validation.formatted}`);
    console.log(`📱 Formatted for Cognito: ${formatted}`);
  } else {
    console.log(`❌ Invalid: ${validation.error}`);
  }
  
  console.log('---');
});

console.log('\n📋 AWS Cognito Phone Number Requirements:');
console.log('- Must be in E.164 format: +[country code][number]');
console.log('- Must start with +');
console.log('- Must include country code');
console.log('- Must be between 7 and 15 digits total');
console.log('- No spaces, dashes, or other characters allowed');
console.log('- Examples: +573178901234, +525512345678, +15551234567');

console.log('\n💡 Tips for Colombia (+57):');
console.log('- Mobile numbers: +57 3XX XXX XXXX');
console.log('- Landline numbers: +57 1XX XXX XXXX or +57 4XX XXX XXXX');
console.log('- Must have exactly 10 digits after +57');

console.log('\n💡 Tips for Mexico (+52):');
console.log('- Mobile numbers: +52 1XX XXX XXXX');
console.log('- Landline numbers: +52 XX XXXX XXXX');
console.log('- Must have exactly 10 digits after +52'); 