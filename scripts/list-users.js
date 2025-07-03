const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

async function listUsers() {
  try {
    console.log('🔍 Listing users from User Pool...');
    console.log('📋 User Pool ID:', USER_POOL_ID);

    const command = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 5 // Limit to first 5 users
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

    // If we have users, test the first one
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n🔍 Testing first user: ${firstUser.Username}`);
      
      // Find email attribute
      const emailAttr = firstUser.Attributes?.find(attr => attr.Name === 'email');
      if (emailAttr) {
        console.log(`📧 Email found: ${emailAttr.Value}`);
        console.log('💡 You can test this user with:');
        console.log(`node scripts/test-user-attributes.js "${emailAttr.Value}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
listUsers(); 