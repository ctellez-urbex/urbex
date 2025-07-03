import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cognito configuration...');
    console.log('USER_POOL_ID:', USER_POOL_ID);
    console.log('AWS_REGION:', process.env.AWS_REGION);

    if (!USER_POOL_ID) {
      return NextResponse.json(
        { success: false, error: 'USER_POOL_ID not configured' },
        { status: 500 }
      );
    }

    const listUsersCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 1, // Just get one user to test
    });

    console.log('Sending ListUsersCommand...');
    const result = await cognitoClient.send(listUsersCommand);
    
    console.log('Cognito test successful');
    
    return NextResponse.json({
      success: true,
      message: 'Cognito connection successful',
      userCount: result.Users?.length || 0,
      paginationToken: result.PaginationToken ? 'Available' : 'None'
    });

  } catch (error: any) {
    console.error('Cognito test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      name: error.name,
      code: error.$metadata?.httpStatusCode
    }, { status: 500 });
  }
} 