import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/aws/cognito'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📧 Resending confirmation code to:', email)

    const result = await authService.resendConfirmationCode(email)

    if (result.success) {
      console.log('✅ Confirmation code resent successfully')
      return NextResponse.json({ 
        message: 'Código de confirmación reenviado correctamente',
        email 
      })
    } else {
      console.error('🔴 Failed to resend confirmation code:', result.error)
      return NextResponse.json(
        { error: result.error || 'Error al reenviar código de confirmación' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('🔴 Error in resend confirmation API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 