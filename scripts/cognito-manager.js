#!/usr/bin/env node

/**
 * Consolidated Cognito Management Script
 * 
 * Combines functionality from:
 * - list-users.js (list users)
 * - update-user-attributes.js (update user attributes)
 * - setup-cognito-attributes.js (setup custom attributes)
 * 
 * Usage:
 *   node scripts/cognito-manager.js list                    # List users
 *   node scripts/cognito-manager.js list --limit 10         # List with limit
 *   node scripts/cognito-manager.js get <email>             # Get specific user
 *   node scripts/cognito-manager.js update-attributes       # Update all users' attributes
 *   node scripts/cognito-manager.js setup-attributes        # Setup custom attributes
 *   node scripts/cognito-manager.js --help                  # Show help
 */

const { 
  CognitoIdentityProviderClient, 
  ListUsersCommand, 
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  DescribeUserPoolCommand,
  UpdateUserPoolCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { execSync } = require('child_process');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const showHelp = args.includes('--help');

if (showHelp || !command) {
  console.log(`
🔧 Cognito Manager Script - Usage Options:

  node scripts/cognito-manager.js list                    # List users
  node scripts/cognito-manager.js list --limit 10         # List with limit
  node scripts/cognito-manager.js get <email>             # Get specific user
  node scripts/cognito-manager.js update-attributes       # Update all users' attributes
  node scripts/cognito-manager.js setup-attributes        # Setup custom attributes
  node scripts/cognito-manager.js --help                  # Show this help

Environment Variables Required:
  - AWS_USER_POOL_ID: Your Cognito User Pool ID
  - AWS_REGION: AWS region (default: us-east-2)
  - AWS_ACCESS_KEY_ID: AWS access key
  - AWS_SECRET_ACCESS_KEY: AWS secret key
`);
  process.exit(0);
}

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

if (!USER_POOL_ID) {
  console.error('❌ AWS_USER_POOL_ID environment variable is required');
  process.exit(1);
}

// ============================================================================
// LIST USERS FUNCTIONS
// ============================================================================

async function listUsers() {
  try {
    const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 5;
    
    console.log('🔍 Listing users from User Pool...');
    console.log('📋 User Pool ID:', USER_POOL_ID);
    console.log('📊 Limit:', limit);

    const command = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: limit
    });

    const response = await cognitoClient.send(command);
    const users = response.Users || [];

    console.log(`\n📊 Found ${users.length} users:`);

    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('Username:', user.Username);
      console.log('Status:', user.UserStatus);
      console.log('Enabled:', user.Enabled);
      
      if (user.Attributes) {
        console.log('Attributes:');
        user.Attributes.forEach(attr => {
          console.log(`  ${attr.Name} = ${attr.Value}`);
        });
      }
    });

    // If we have users, show testing suggestion
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n🔍 Testing first user: ${firstUser.Username}`);
      
      const emailAttr = firstUser.Attributes?.find(attr => attr.Name === 'email');
      if (emailAttr) {
        console.log(`📧 Email found: ${emailAttr.Value}`);
        console.log('💡 You can test this user with:');
        console.log(`node scripts/cognito-manager.js get "${emailAttr.Value}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

// ============================================================================
// GET USER FUNCTIONS
// ============================================================================

async function getUser(email) {
  try {
    if (!email) {
      console.log('❌ Please provide an email as argument');
      console.log('Usage: node scripts/cognito-manager.js get user@example.com');
      return;
    }

    console.log('🔍 Getting user details for:', email);
    console.log('📋 User Pool ID:', USER_POOL_ID);

    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });

    const response = await cognitoClient.send(command);
    
    console.log('\n📊 User Info:');
    console.log('Username:', response.Username);
    console.log('Status:', response.UserStatus);
    console.log('Enabled:', response.Enabled);
    console.log('Created:', response.UserCreateDate);
    console.log('Modified:', response.UserLastModifiedDate);

    console.log('\n📋 All Attributes:');
    if (response.UserAttributes) {
      response.UserAttributes.forEach(attr => {
        console.log(`${attr.Name} = ${attr.Value}`);
      });
    }

    // Check for specific attributes
    const attributes = response.UserAttributes || [];
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
    console.error('❌ Error getting user:', error.message);
  }
}

// ============================================================================
// UPDATE ATTRIBUTES FUNCTIONS
// ============================================================================

async function updateUserAttributes() {
  try {
    console.log('🔍 Starting user attributes update process...');
    console.log('📋 User Pool ID:', USER_POOL_ID);

    // List all users
    const listCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID
    });

    const usersResponse = await cognitoClient.send(listCommand);
    const users = usersResponse.Users || [];

    console.log(`📊 Found ${users.length} users`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const username = user.Username;
        console.log(`\n🔍 Processing user: ${username}`);

        // Check if user already has custom attributes
        const hasCustomPlan = user.Attributes?.some(attr => attr.Name === 'custom:plan');
        const hasCustomSu = user.Attributes?.some(attr => attr.Name === 'custom:su');

        if (hasCustomPlan && hasCustomSu) {
          console.log(`✅ User ${username} already has custom attributes, skipping...`);
          continue;
        }

        // Prepare attributes to update
        const attributesToUpdate = [];

        if (!hasCustomPlan) {
          attributesToUpdate.push({
            Name: 'custom:plan',
            Value: 'Mensual' // Default plan
          });
          console.log(`📋 Will add custom:plan = 'Mensual'`);
        }

        if (!hasCustomSu) {
          attributesToUpdate.push({
            Name: 'custom:su',
            Value: '1' // Default SU value (must be greater than 1)
          });
          console.log(`📋 Will add custom:su = '1'`);
        }

        if (attributesToUpdate.length > 0) {
          const updateCommand = new AdminUpdateUserAttributesCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            UserAttributes: attributesToUpdate
          });

          await cognitoClient.send(updateCommand);
          console.log(`✅ Updated attributes for user ${username}`);
          updatedCount++;
        }

      } catch (error) {
        console.error(`❌ Error updating user ${user.Username}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📋 Total processed: ${users.length} users`);

  } catch (error) {
    console.error('❌ Error in update process:', error);
  }
}

// ============================================================================
// SETUP ATTRIBUTES FUNCTIONS
// ============================================================================

async function setupCustomAttributes() {
  try {
    console.log('🔧 Setting up Cognito custom attributes...');
    console.log(`📋 User Pool ID: ${USER_POOL_ID}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-2'}`);

    // First, let's check if the custom attribute already exists
    console.log('\n📊 Checking existing custom attributes...');
    
    try {
      const describeCommand = new DescribeUserPoolCommand({
        UserPoolId: USER_POOL_ID
      });
      
      const userPoolResponse = await cognitoClient.send(describeCommand);
      const customAttributes = userPoolResponse.UserPool.SchemaAttributes || [];
      
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
    
    // Create the custom attribute using AWS CLI (more reliable for schema updates)
    console.log('\n🔨 Creating custom plan attribute...');
    
    const updateCommand = `aws cognito-idp update-user-pool \
      --user-pool-id ${USER_POOL_ID} \
      --region ${process.env.AWS_REGION || 'us-east-2'} \
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
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🔧 Cognito Manager Script\n');
  
  switch (command) {
    case 'list':
      await listUsers();
      break;
      
    case 'get':
      const email = args[1];
      await getUser(email);
      break;
      
    case 'update-attributes':
      await updateUserAttributes();
      break;
      
    case 'setup-attributes':
      await setupCustomAttributes();
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