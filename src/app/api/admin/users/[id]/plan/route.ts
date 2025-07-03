import { NextRequest, NextResponse } from 'next/server'
import { updateUserPlan } from '@/lib/cognito-admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { plan } = await request.json()

    await updateUserPlan(id, plan)

    return NextResponse.json({ 
      message: 'Plan del usuario actualizado correctamente',
      userId: id,
      plan 
    })

  } catch (error) {
    console.error('Error updating user plan:', error)
    return NextResponse.json(
      { error: 'Error al actualizar plan del usuario' },
      { status: 500 }
    )
  }
} 