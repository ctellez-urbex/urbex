import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'
import { createUser } from '@/lib/cognito-admin'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const USER_POOL_ID = process.env.AWS_USER_POOL_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a create user request or a list users request
    if (body.action === 'create') {
      // Create new user
      const { email, firstName, lastName, phone, plan } = body.userData
      
      const result = await createUser({
        email,
        firstName,
        lastName,
        phone,
        plan
      })

      if (result.success) {
        return NextResponse.json({
          message: 'Usuario creado correctamente',
          userId: result.userId
        })
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }
    } else {
      // List users (existing functionality)
      const { filters, pagination } = body
      
      // Build filter string for Cognito with length limit
      let filterString = ''
      
      if (filters.search) {
        // Check if search term is too long for multiple OR conditions
        const searchTerm = filters.search.trim()
        if (searchTerm.length > 50) {
          // If search term is too long, only search by email
          filterString = `email ^= "${searchTerm}"`
        } else {
          // Build multiple OR conditions only if search term is short enough
          const conditions = [
            `email ^= "${searchTerm}"`,
            `given_name ^= "${searchTerm}"`,
            `family_name ^= "${searchTerm}"`,
            `phone_number ^= "${searchTerm}"`
          ]
          filterString = conditions.join(' OR ')
        }
      }
      
      if (filters.status !== 'all') {
        if (filterString) filterString += ' AND '
        filterString += `cognito:user_status = "${filters.status}"`
      }
      
      if (filters.plan !== 'all') {
        if (filterString) filterString += ' AND '
        filterString += `custom:plan = "${filters.plan}"`
      }
      
      // Ensure filter string doesn't exceed Cognito's 256 character limit
      if (filterString.length > 256) {
        console.warn('Filter string too long, truncating to email search only')
        if (filters.search) {
          filterString = `email ^= "${filters.search.trim()}"`
        } else {
          filterString = ''
        }
      }

      // List users from Cognito
      const listUsersCommand = new ListUsersCommand({
        UserPoolId: USER_POOL_ID!,
        Limit: pagination.limit,
        PaginationToken: pagination.page > 1 ? `page_${pagination.page}` : undefined,
        Filter: filterString || undefined,
      })

      if (filterString) {
        console.log('Using filter:', filterString, 'Length:', filterString.length)
      }

      const cognitoResponse = await cognito.send(listUsersCommand)

      // Transform Cognito users to our format
      const users = cognitoResponse.Users?.map((user: any) => {
        const email = user.Attributes?.find((attr: any) => attr.Name === 'email')?.Value || ''
        const firstName = user.Attributes?.find((attr: any) => attr.Name === 'given_name')?.Value || ''
        const lastName = user.Attributes?.find((attr: any) => attr.Name === 'family_name')?.Value || ''
        const phone = user.Attributes?.find((attr: any) => attr.Name === 'phone_number')?.Value || ''
        const plan = user.Attributes?.find((attr: any) => attr.Name === 'custom:plan')?.Value || 'Mensual'
        
        // Map Cognito status to our application status with Spanish translations
        let userStatus: 'active' | 'inactive' | 'pending' | 'disabled' = 'pending'
        let statusText: string = 'Pendiente'
        
        switch (user.UserStatus) {
          case 'CONFIRMED':
            userStatus = user.Enabled ? 'active' : 'disabled'
            statusText = user.Enabled ? 'Activo' : 'Deshabilitado'
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
        
        return {
          id: user.Username || '',
          email,
          firstName,
          lastName,
          phone,
          status: userStatus,
          statusText,
          plan,
          createdAt: user.UserCreateDate?.toISOString() || '',
          lastLogin: user.UserLastModifiedDate?.toISOString() || undefined,
        }
      }) || []

      return NextResponse.json({
        users,
        total: cognitoResponse.PaginationToken ? users.length + pagination.limit : users.length,
        paginationToken: cognitoResponse.PaginationToken
      })
    }

  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 