import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { getVerificationCode, removeVerificationCode } from '@/lib/auth/verification-store';

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

// Store verification codes in memory (in production, use Redis or database)
// This should be shared with the forgot-password route
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Get stored verification code
    const storedData = getVerificationCode(email);
    if (!storedData) {
      return NextResponse.json(
        { success: false, error: 'No password reset request found for this email. Please request a new code.' },
        { status: 400 }
      );
    }

    // Validate verification code
    if (storedData.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Reset password in Cognito
    try {
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: newPassword,
        Permanent: true, // Set to true to make the password permanent
      });

      await cognitoClient.send(setPasswordCommand);

      // Remove the used verification code
      removeVerificationCode(email);

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      });

    } catch (error: any) {
      console.error('Cognito password reset error:', error);
      
      if (error.name === 'UserNotFoundException') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (error.name === 'InvalidPasswordException') {
        return NextResponse.json(
          { success: false, error: 'Password does not meet requirements' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to reset password' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 