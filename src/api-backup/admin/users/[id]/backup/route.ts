import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/cognito-admin'
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const USER_POOL_ID = process.env.AWS_USER_POOL_ID

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const body = await request.json()
    
    await updateUser(userId, body)
    
    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      userId: userId
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Get user from Cognito by username (which is the email)
    const adminGetUserCommand = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID!,
      Username: userId
    })

    const cognitoResponse = await cognito.send(adminGetUserCommand)
    const attributes = cognitoResponse.UserAttributes || []
    const email = attributes.find(attr => attr.Name === 'email')?.Value || ''
    const firstName = attributes.find(attr => attr.Name === 'given_name')?.Value || ''
    const lastName = attributes.find(attr => attr.Name === 'family_name')?.Value || ''
    const phone = attributes.find(attr => attr.Name === 'phone_number')?.Value || ''
    const plan = attributes.find(attr => attr.Name === 'custom:plan')?.Value || 'Mensual'
    
    // Map Cognito status to our application status with Spanish translations
    let userStatus: 'active' | 'inactive' | 'pending' | 'disabled' = 'pending'
    let statusText: string = 'Pendiente'
    const enabled = cognitoResponse.Enabled
    const userStatusRaw = cognitoResponse.UserStatus
    
    switch (userStatusRaw) {
      case 'CONFIRMED':
        userStatus = enabled ? 'active' : 'disabled'
        statusText = enabled ? 'Activo' : 'Deshabilitado'
        break
      case 'UNCONFIRMED':
        userStatus = 'pending'
        statusText = 'Pendiente de Confirmación'
        break
      case 'ARCHIVED':
        userStatus = 'inactive'
        statusText = 'Inactivo'
        break
      case 'COMPROMISED':
        userStatus = 'inactive'
        statusText = 'Comprometido'
        break
      case 'UNKNOWN':
        userStatus = 'inactive'
        statusText = 'Desconocido'
        break
      case 'RESET_REQUIRED':
        userStatus = 'pending'
        statusText = 'Reinicio Requerido'
        break
      case 'FORCE_CHANGE_PASSWORD':
        userStatus = 'pending'
        statusText = 'Cambio de Contraseña Requerido'
        break
      default:
        userStatus = 'pending'
        statusText = 'Pendiente'
    }
    
    const userData = {
      id: cognitoResponse.Username || '',
      email,
      firstName,
      lastName,
      phone,
      status: userStatus,
      statusText,
      plan,
      createdAt: cognitoResponse.UserCreateDate?.toISOString() || '',
      lastLogin: cognitoResponse.UserLastModifiedDate?.toISOString() || undefined,
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('Error getting user data:', error)
    
    // Handle specific Cognito errors
    if (error instanceof Error) {
      if (error.message.includes('User does not exist')) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      if (error.message.includes('NotAuthorizedException')) {
        return NextResponse.json(
          { error: 'No autorizado para acceder a este usuario' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 