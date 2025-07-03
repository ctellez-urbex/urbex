/**
 * API route to disable a Cognito user by email.
 * POST body: { email: string }
 * Response: { success: boolean, message?: string, error?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminDisableUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const disableUserCommand = new AdminDisableUserCommand({
      UserPoolId: USER_POOL_ID!,
      Username: email,
    });
    
    await cognito.send(disableUserCommand);

    return NextResponse.json({ success: true, message: `User ${email} disabled successfully.` });
  } catch (error) {
    console.error('Error disabling user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 