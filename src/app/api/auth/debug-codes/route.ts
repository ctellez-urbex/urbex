import { NextRequest, NextResponse } from 'next/server';
import { getAllStoredCodes } from '@/lib/auth/verification-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const allCodes = getAllStoredCodes();
      const userCode = allCodes.find(code => code.email === email);
      
      return NextResponse.json({
        success: true,
        email,
        hasCode: !!userCode,
        code: userCode?.code || null,
        expires: userCode?.expires || null,
        isExpired: userCode?.isExpired || null,
        currentTime: Date.now()
      });
    }

    // Return all stored codes (for debugging)
    const allCodes = getAllStoredCodes();

    return NextResponse.json({
      success: true,
      totalCodes: allCodes.length,
      codes: allCodes,
      currentTime: Date.now()
    });

  } catch (error) {
    console.error('Debug codes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 