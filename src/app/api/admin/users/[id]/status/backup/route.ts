import { NextRequest, NextResponse } from 'next/server'
import { updateUserStatus } from '@/lib/cognito-admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    await updateUserStatus(id, status)

    return NextResponse.json({ 
      message: 'Estado del usuario actualizado correctamente',
      userId: id,
      status 
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado del usuario' },
      { status: 500 }
    )
  }
} 