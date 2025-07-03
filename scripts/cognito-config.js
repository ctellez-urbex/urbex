#!/usr/bin/env node

/**
 * Consolidated Cognito Configuration Script
 * 
 * Combines functionality from:
 * - check-cognito-email-config.js (check email configuration)
 * - configure-cognito-email-verification.js (configure email verification)
 * 
 * Usage:
 *   node scripts/cognito-config.js check                    # Check current configuration
 *   node scripts/cognito-config.js configure                # Configure email verification
 *   node scripts/cognito-config.js --help                   # Show help
 */

const { execSync } = require('child_process');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const showHelp = args.includes('--help');

if (showHelp || !command) {
  console.log(`
🔧 Cognito Configuration Script - Usage Options:

  node scripts/cognito-config.js check                    # Check current configuration
  node scripts/cognito-config.js configure                # Configure email verification
  node scripts/cognito-config.js --help                   # Show this help

Environment Variables Required:
  - AWS_USER_POOL_ID: Your Cognito User Pool ID
  - AWS_REGION: AWS region (default: us-east-2)
  - AWS_ACCESS_KEY_ID: AWS access key
  - AWS_SECRET_ACCESS_KEY: AWS secret key
`);
  process.exit(0);
}

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

if (!USER_POOL_ID) {
  console.error('❌ AWS_USER_POOL_ID environment variable is required');
  process.exit(1);
}

// ============================================================================
// CHECK CONFIGURATION FUNCTIONS
// ============================================================================

async function checkCognitoConfiguration() {
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
}

// ============================================================================
// CONFIGURE EMAIL VERIFICATION FUNCTIONS
// ============================================================================

async function configureEmailVerification() {
  console.log('🔧 Configuring Cognito email verification...');
  console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
  console.log(`🌍 Region: ${AWS_REGION}`);

  try {
    // Step 1: Configure email sending account
    console.log('\n1️⃣ Configuring email sending account...');
    
    const emailConfigCommand = `aws cognito-idp update-user-pool \
      --user-pool-id ${USER_POOL_ID} \
      --region ${AWS_REGION} \
      --email-configuration EmailSendingAccount=COGNITO_DEFAULT`;
    
    execSync(emailConfigCommand, { encoding: 'utf8' });
    console.log('✅ Email sending account configured to COGNITO_DEFAULT');
    
    // Step 2: Enable email verification
    console.log('\n2️⃣ Enabling email verification...');
    
    const verificationCommand = `aws cognito-idp update-user-pool \
      --user-pool-id ${USER_POOL_ID} \
      --region ${AWS_REGION} \
      --auto-verified-attributes email`;
    
    execSync(verificationCommand, { encoding: 'utf8' });
    console.log('✅ Email verification enabled');
    
    // Step 3: Configure verification message template
    console.log('\n3️⃣ Configuring verification message template...');
    
    const messageTemplateCommand = `aws cognito-idp update-user-pool \
      --user-pool-id ${USER_POOL_ID} \
      --region ${AWS_REGION} \
      --verification-message-template EmailSubject="Confirm your email address" EmailMessage="Your verification code is {####}"`;
    
    execSync(messageTemplateCommand, { encoding: 'utf8' });
    console.log('✅ Verification message template configured');
    
    // Step 4: Configure admin create user settings
    console.log('\n4️⃣ Configuring admin create user settings...');
    
    const adminCreateCommand = `aws cognito-idp update-user-pool \
      --user-pool-id ${USER_POOL_ID} \
      --region ${AWS_REGION} \
      --admin-create-user-config AllowAdminCreateUserOnly=false`;
    
    execSync(adminCreateCommand, { encoding: 'utf8' });
    console.log('✅ Admin create user settings configured');
    
    console.log('\n✅ Email verification configuration completed!');
    console.log('\n📝 Configuration Summary:');
    console.log('- Email sending account: COGNITO_DEFAULT');
    console.log('- Email verification: Enabled');
    console.log('- Verification message: Custom template');
    console.log('- Admin create user: Disabled (users can self-register)');
    
    console.log('\n🔍 Next steps:');
    console.log('1. Test user registration with a new email');
    console.log('2. Check if confirmation email is received');
    console.log('3. Verify the confirmation code works');
    console.log('4. Monitor CloudWatch logs for any issues');
    
  } catch (error) {
    console.error('❌ Error configuring email verification:', error.message);
    
    if (error.message.includes('AccessDenied')) {
      console.log('\n💡 Make sure your AWS credentials have the following permissions:');
      console.log('- cognito-idp:UpdateUserPool');
    }
    
    if (error.message.includes('InvalidParameterException')) {
      console.log('\n💡 There might be a configuration conflict. Check the AWS Console for current settings.');
    }
    
    process.exit(1);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🔧 Cognito Configuration Script\n');
  
  switch (command) {
    case 'check':
      await checkCognitoConfiguration();
      break;
      
    case 'configure':
      await configureEmailVerification();
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