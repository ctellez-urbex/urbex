#!/usr/bin/env node

/**
 * Script to check AWS Cognito email configuration
 * 
 * This script helps diagnose why confirmation emails are not being sent
 * 
 * Prerequisites:
 * 1. AWS CLI configured with appropriate credentials
 * 2. AWS_REGION environment variable set
 * 3. AWS_USER_POOL_ID environment variable set
 * 
 * Usage:
 * node scripts/check-cognito-email-config.js
 */

const { execSync } = require('child_process');
require('dotenv').config();

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

if (!USER_POOL_ID) {
  console.error('❌ AWS_USER_POOL_ID environment variable is required');
  process.exit(1);
}

console.log('🔍 Checking Cognito email configuration...');
console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);

try {
  // Get User Pool details
  console.log('\n📊 Fetching User Pool configuration...');
  
  const describeResult = execSync(
    `aws cognito-idp describe-user-pool --user-pool-id ${USER_POOL_ID} --region ${AWS_REGION}`,
    { encoding: 'utf8' }
  );
  
  const userPool = JSON.parse(describeResult);
  const pool = userPool.UserPool;
  
  console.log('✅ User Pool found successfully');
  
  // Check email configuration
  console.log('\n📧 Email Configuration:');
  
  const emailConfig = pool.EmailConfiguration;
  if (emailConfig) {
    console.log('📤 Email Source:', emailConfig.EmailSendingAccount || 'Not configured');
    console.log('📧 From Email:', emailConfig.From || 'Not configured');
    console.log('📧 Reply To Email:', emailConfig.ReplyToEmailAddress || 'Not configured');
  } else {
    console.log('❌ No email configuration found');
  }
  
  // Check verification settings
  console.log('\n✅ Verification Settings:');
  
  const autoVerifiedAttributes = pool.AutoVerifiedAttributes || [];
  console.log('🔐 Auto-verified attributes:', autoVerifiedAttributes);
  
  const verificationMessageTemplate = pool.VerificationMessageTemplate;
  if (verificationMessageTemplate) {
    console.log('📝 Email subject:', verificationMessageTemplate.EmailSubject || 'Default subject');
    console.log('📝 Email message:', verificationMessageTemplate.EmailMessage || 'Default message');
  }
  
  // Check admin create user settings
  console.log('\n👤 Admin Create User Settings:');
  
  const adminCreateUserConfig = pool.AdminCreateUserConfig;
  if (adminCreateUserConfig) {
    console.log('📧 Allow admin create user:', adminCreateUserConfig.AllowAdminCreateUserOnly || false);
    console.log('📧 Invite message template:', adminCreateUserConfig.InviteMessageTemplate || 'Not configured');
  }
  
  // Check message customizations
  console.log('\n💬 Message Customizations:');
  
  const userPoolAddOns = pool.UserPoolAddOns;
  if (userPoolAddOns && userPoolAddOns.AdvancedSecurityMode) {
    console.log('🔒 Advanced security mode:', userPoolAddOns.AdvancedSecurityMode);
  }
  
  // Check policies
  console.log('\n📋 Password Policy:');
  
  const policies = pool.Policies;
  if (policies && policies.PasswordPolicy) {
    const passwordPolicy = policies.PasswordPolicy;
    console.log('🔢 Minimum length:', passwordPolicy.MinimumLength || 'Not set');
    console.log('🔤 Require uppercase:', passwordPolicy.RequireUppercase || false);
    console.log('🔤 Require lowercase:', passwordPolicy.RequireLowercase || false);
    console.log('🔢 Require numbers:', passwordPolicy.RequireNumbers || false);
    console.log('🔣 Require symbols:', passwordPolicy.RequireSymbols || false);
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!emailConfig || !emailConfig.EmailSendingAccount) {
    console.log('⚠️  Email sending account not configured');
    console.log('   → Go to AWS Console > Cognito > User Pools > Your Pool > Messaging');
    console.log('   → Configure "Email configuration"');
    console.log('   → Choose "COGNITO_DEFAULT" or "DEVELOPER"');
  }
  
  if (!autoVerifiedAttributes.includes('email')) {
    console.log('⚠️  Email is not set as auto-verified attribute');
    console.log('   → Go to AWS Console > Cognito > User Pools > Your Pool > Sign-up experience');
    console.log('   → Enable "Cognito-assisted verification and confirmation"');
    console.log('   → Check "Email" as verification method');
  }
  
  if (!verificationMessageTemplate) {
    console.log('⚠️  No verification message template configured');
    console.log('   → Go to AWS Console > Cognito > User Pools > Your Pool > Messaging');
    console.log('   → Configure "Verification message template"');
  }
  
  console.log('\n✅ Configuration check completed');
  console.log('\n📝 Next steps:');
  console.log('1. Check your email spam folder');
  console.log('2. Verify the email address is correct');
  console.log('3. Use the "Reenviar código" button on the verification page');
  console.log('4. Check AWS CloudWatch logs for email delivery issues');
  
} catch (error) {
  console.error('❌ Error checking Cognito configuration:', error.message);
  
  if (error.message.includes('AccessDenied')) {
    console.log('\n💡 Make sure your AWS credentials have the following permissions:');
    console.log('- cognito-idp:DescribeUserPool');
  }
  
  if (error.message.includes('ResourceNotFoundException')) {
    console.log('\n💡 User Pool not found. Check your AWS_USER_POOL_ID environment variable.');
  }
  
  process.exit(1);
} 