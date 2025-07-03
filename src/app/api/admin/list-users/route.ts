import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

export async function GET(request: NextRequest) {
  try {
    console.log('Listing users from Cognito...');
    
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 10,
    });

    const result = await cognitoClient.send(listUsersCommand);
    
    const users = result.Users?.map(user => {
      const email = user.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
      const emailVerified = user.Attributes?.find(attr => attr.Name === 'email_verified')?.Value || 'false';
      
      return {
        username: user.Username,
        email,
        emailVerified,
        status: user.UserStatus,
        createdAt: user.UserCreateDate?.toISOString(),
      };
    }) || [];

    console.log(`Found ${users.length} users`);
    
    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error: any) {
    console.error('Error listing users:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      name: error.name
    }, { status: 500 });
  }
} 