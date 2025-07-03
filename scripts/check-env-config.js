#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🔍 Checking AWS Cognito Configuration...\n');

const requiredVars = {
  'AWS_USER_POOL_ID': process.env.AWS_USER_POOL_ID,
  'AWS_POOL_CLIENT_ID': process.env.AWS_POOL_CLIENT_ID,
  'AWS_REGION': process.env.AWS_REGION,
  'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
  'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
};

console.log('📋 Environment Variables Status:');
console.log('================================');

let allConfigured = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 10)}...` : 'NOT SET';
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!value) {
    allConfigured = false;
  }
});

console.log('\n📊 Summary:');
if (allConfigured) {
  console.log('✅ All required environment variables are configured');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('\n🔧 To fix this, create a .env.local file with:');
  console.log('AWS_USER_POOL_ID=your_user_pool_id');
  console.log('AWS_POOL_CLIENT_ID=your_client_id');
  console.log('AWS_REGION=us-east-2');
  console.log('AWS_ACCESS_KEY_ID=your_access_key');
  console.log('AWS_SECRET_ACCESS_KEY=your_secret_key');
}

console.log('\n🌐 Current NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('📁 Current working directory:', process.cwd()); 