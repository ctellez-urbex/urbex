#!/usr/bin/env node

/**
 * Script to set up custom attributes in AWS Cognito User Pool
 * 
 * Prerequisites:
 * 1. AWS CLI configured with appropriate credentials
 * 2. AWS_REGION environment variable set
 * 3. AWS_USER_POOL_ID environment variable set
 * 
 * Usage:
 * node scripts/setup-cognito-attributes.js
 */

const { execSync } = require('child_process');
require('dotenv').config();

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

if (!USER_POOL_ID) {
  console.error('❌ AWS_USER_POOL_ID environment variable is required');
  process.exit(1);
}

console.log('🔧 Setting up Cognito custom attributes...');
console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);

try {
  // First, let's check if the custom attribute already exists
  console.log('\n📊 Checking existing custom attributes...');
  
  try {
    const describeResult = execSync(
      `aws cognito-idp describe-user-pool --user-pool-id ${USER_POOL_ID} --region ${AWS_REGION}`,
      { encoding: 'utf8' }
    );
    
    const userPool = JSON.parse(describeResult);
    const customAttributes = userPool.UserPool.SchemaAttributes || [];
    
    const planAttribute = customAttributes.find(attr => 
      attr.Name === 'custom:plan'
    );
    
    if (planAttribute) {
      console.log('✅ Custom plan attribute already exists!');
      console.log('📋 Attribute details:', JSON.stringify(planAttribute, null, 2));
      return;
    }
    
    console.log('❌ Custom plan attribute not found. Creating...');
    
  } catch (error) {
    console.log('⚠️  Could not check existing attributes, proceeding with creation...');
  }
  
  // Create the custom attribute
  console.log('\n🔨 Creating custom plan attribute...');
  
  const updateCommand = `aws cognito-idp update-user-pool \
    --user-pool-id ${USER_POOL_ID} \
    --region ${AWS_REGION} \
    --schema Name=custom:plan,AttributeDataType=String,Required=false,Mutable=true`;
  
  execSync(updateCommand, { encoding: 'utf8' });
  
  console.log('✅ Custom plan attribute created successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. The custom:plan attribute is now available in your User Pool');
  console.log('2. You can uncomment the plan attribute code in src/lib/aws/cognito.ts');
  console.log('3. Users can now register with plan information');
  console.log('4. Admins can update user plans via the admin interface');
  
} catch (error) {
  console.error('❌ Error setting up Cognito attributes:', error.message);
  
  if (error.message.includes('AccessDenied')) {
    console.log('\n💡 Make sure your AWS credentials have the following permissions:');
    console.log('- cognito-idp:DescribeUserPool');
    console.log('- cognito-idp:UpdateUserPool');
  }
  
  if (error.message.includes('InvalidParameterException')) {
    console.log('\n💡 The custom attribute might already exist or there might be a schema conflict.');
    console.log('Check the AWS Console > Cognito > User Pools > Your Pool > Sign-up experience > Custom attributes');
  }
  
  process.exit(1);
} 