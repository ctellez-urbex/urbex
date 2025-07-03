const { CognitoIdentityProviderClient, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

async function testUserAttributes() {
  try {
    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email as argument');
      console.log('Usage: node scripts/test-user-attributes.js user@example.com');
      return;
    }

    console.log('🔍 Testing user attributes for:', email);
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
    console.error('❌ Error:', error.message);
  }
}

// Run the script
testUserAttributes(); 