import { NextRequest, NextResponse } from 'next/server';
import { getStoredCodeForTesting } from '@/lib/auth/verification-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const code = getStoredCodeForTesting(email);

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'No verification code found for this email' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      code,
      message: 'Verification code retrieved successfully'
    });

  } catch (error) {
    console.error('Test code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 