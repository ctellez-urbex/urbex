#!/usr/bin/env node

/**
 * Script to configure email verification in AWS Cognito User Pool
 * 
 * This script enables email verification for user registration
 * 
 * Prerequisites:
 * 1. AWS CLI configured with appropriate credentials
 * 2. AWS_REGION environment variable set
 * 3. AWS_USER_POOL_ID environment variable set
 * 
 * Usage:
 * node scripts/configure-cognito-email-verification.js
 */

const { execSync } = require('child_process');
require('dotenv').config();

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

if (!USER_POOL_ID) {
  console.error('❌ AWS_USER_POOL_ID environment variable is required');
  process.exit(1);
}

console.log('🔧 Configuring Cognito email verification...');
console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);

try {
  // First, let's check the current configuration
  console.log('\n📊 Checking current configuration...');
  
  const describeResult = execSync(
    `aws cognito-idp describe-user-pool --user-pool-id ${USER_POOL_ID} --region ${AWS_REGION}`,
    { encoding: 'utf8' }
  );
  
  const userPool = JSON.parse(describeResult);
  const pool = userPool.UserPool;
  
  console.log('✅ User Pool found successfully');
  
  // Check current verification settings
  const autoVerifiedAttributes = pool.AutoVerifiedAttributes || [];
  const adminCreateUserConfig = pool.AdminCreateUserConfig;
  
  console.log('\n📧 Current verification settings:');
  console.log('🔐 Auto-verified attributes:', autoVerifiedAttributes);
  console.log('👤 Allow admin create user:', adminCreateUserConfig?.AllowAdminCreateUserOnly || false);
  
  // Check if email verification is already enabled
  if (autoVerifiedAttributes.includes('email')) {
    console.log('✅ Email verification is already enabled!');
    return;
  }
  
  console.log('\n⚠️  Email verification is not enabled. Configuring...');
  
  // Configure email verification
  console.log('\n🔨 Enabling email verification...');
  
  const updateCommand = `aws cognito-idp update-user-pool \
    --user-pool-id ${USER_POOL_ID} \
    --region ${AWS_REGION} \
    --auto-verified-attributes email`;
  
  execSync(updateCommand, { encoding: 'utf8' });
  
  console.log('✅ Email verification enabled successfully!');
  
  // Verify the configuration
  console.log('\n📊 Verifying configuration...');
  
  const verifyResult = execSync(
    `aws cognito-idp describe-user-pool --user-pool-id ${USER_POOL_ID} --region ${AWS_REGION}`,
    { encoding: 'utf8' }
  );
  
  const updatedPool = JSON.parse(verifyResult);
  const updatedAutoVerifiedAttributes = updatedPool.UserPool.AutoVerifiedAttributes || [];
  
  if (updatedAutoVerifiedAttributes.includes('email')) {
    console.log('✅ Email verification confirmed!');
    console.log('🔐 Auto-verified attributes:', updatedAutoVerifiedAttributes);
  } else {
    console.log('❌ Email verification not found in updated configuration');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Email verification is now enabled');
  console.log('2. New users will receive confirmation emails');
  console.log('3. Users must confirm their email before they can sign in');
  console.log('4. Test registration with a new email address');
  
} catch (error) {
  console.error('❌ Error configuring Cognito email verification:', error.message);
  
  if (error.message.includes('AccessDenied')) {
    console.log('\n💡 Make sure your AWS credentials have the following permissions:');
    console.log('- cognito-idp:DescribeUserPool');
    console.log('- cognito-idp:UpdateUserPool');
  }
  
  if (error.message.includes('ResourceNotFoundException')) {
    console.log('\n💡 User Pool not found. Check your AWS_USER_POOL_ID environment variable.');
  }
  
  process.exit(1);
} 