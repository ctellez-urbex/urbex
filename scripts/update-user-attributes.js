const { CognitoIdentityProviderClient, ListUsersCommand, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

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

// Run the script
updateUserAttributes(); 