import { CognitoIdentityServiceProvider } from 'aws-sdk'

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const USER_POOL_ID = process.env.AWS_USER_POOL_ID

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  status: 'active' | 'inactive' | 'pending' | 'disabled'
  statusText: string
  plan: string
  createdAt: string
  lastLogin?: string
}

export interface UserFilters {
  search: string
  status: string
  plan: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface UserUpdateData {
  firstName: string
  lastName: string
  phone: string
  status: 'active' | 'inactive' | 'pending' | 'disabled'
  plan: 'monthly' | 'yearly' | 'free'
}

// List users with filters and pagination
export async function listUsers(filters: UserFilters, pagination: Pagination): Promise<{ users: User[], total: number }> {
  try {
    // Build filter string for Cognito
    let filterString = ''
    if (filters.search) {
      filterString += `email ^= "${filters.search}" OR given_name ^= "${filters.search}" OR family_name ^= "${filters.search}" OR phone_number ^= "${filters.search}"`
    }
    if (filters.status !== 'all') {
      if (filterString) filterString += ' AND '
      filterString += `cognito:user_status = "${filters.status}"`
    }
    if (filters.plan !== 'all') {
      if (filterString) filterString += ' AND '
      filterString += `custom:plan = "${filters.plan}"`
    }

    // List users from Cognito
    const listUsersParams: CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: USER_POOL_ID!,
      Limit: pagination.limit,
      PaginationToken: pagination.page > 1 ? `page_${pagination.page}` : undefined,
    }

    if (filterString) {
      listUsersParams.Filter = filterString
    }

    const cognitoResponse = await cognito.listUsers(listUsersParams).promise()

    // Transform Cognito users to our format
    const users: User[] = cognitoResponse.Users?.map(user => {
      const email = user.Attributes?.find(attr => attr.Name === 'email')?.Value || ''
      const firstName = user.Attributes?.find(attr => attr.Name === 'given_name')?.Value || ''
      const lastName = user.Attributes?.find(attr => attr.Name === 'family_name')?.Value || ''
      const phone = user.Attributes?.find(attr => attr.Name === 'phone_number')?.Value || ''
      const plan = user.Attributes?.find(attr => attr.Name === 'custom:plan')?.Value || 'monthly'
      
      // Map Cognito status to our application status with Spanish translations
      let userStatus: 'active' | 'inactive' | 'pending' | 'disabled' = 'pending'
      let statusText: string = 'Pendiente'
      
      switch (user.UserStatus) {
        case 'CONFIRMED':
          userStatus = user.Enabled ? 'active' : 'disabled'
          statusText = user.Enabled ? 'Confirmado' : 'Deshabilitado'
          break
        case 'UNCONFIRMED':
          userStatus = 'pending'
          statusText = 'Pendiente de Confirmación'
          break
        case 'ARCHIVED':
          userStatus = 'inactive'
          statusText = 'Archivado'
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
      
      const userPlan = plan as 'monthly' | 'yearly' | 'free' || 'monthly'
      
      return {
        id: user.Username || '',
        email,
        firstName,
        lastName,
        phone,
        status: userStatus,
        statusText,
        plan: userPlan,
        createdAt: user.UserCreateDate?.toISOString() || '',
        lastLogin: user.UserLastModifiedDate?.toISOString() || undefined,
      }
    }) || []

    return {
      users,
      total: cognitoResponse.PaginationToken ? users.length + pagination.limit : users.length
    }

  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Error al obtener usuarios')
  }
}

// Update user information
export async function updateUser(userId: string, updateData: UserUpdateData): Promise<void> {
  try {
    console.log('Updating user:', userId, 'with data:', updateData)
    
    const attributes: CognitoIdentityServiceProvider.AttributeType[] = [
      {
        Name: 'given_name',
        Value: updateData.firstName
      },
      {
        Name: 'family_name',
        Value: updateData.lastName
      },
      {
        Name: 'phone_number',
        Value: updateData.phone
      }
      // Note: custom:plan attribute removed as it doesn't exist in the schema
      // You need to create this custom attribute in Cognito User Pool first
    ]

    console.log('Updating Cognito attributes:', attributes)

    const result = await cognito.adminUpdateUserAttributes({
      UserPoolId: USER_POOL_ID!,
      Username: userId,
      UserAttributes: attributes
    }).promise()

    console.log('User update successful:', result)

  } catch (error) {
    console.error('Error updating user in Cognito:', error)
    if (error instanceof Error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`)
    }
    throw new Error('Error al actualizar usuario')
  }
}

// Update user status
export async function updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
  try {
    console.log('Updating user status:', userId, 'to:', status)
    
    if (status === 'active') {
      // Enable user and confirm them if they were unconfirmed
      console.log('Enabling user:', userId)
      await cognito.adminEnableUser({
        UserPoolId: USER_POOL_ID!,
        Username: userId
      }).promise()
      
      // Also confirm the user if they were unconfirmed
      try {
        console.log('Confirming user signup:', userId)
        await cognito.adminConfirmSignUp({
          UserPoolId: USER_POOL_ID!,
          Username: userId
        }).promise()
        console.log('User confirmed successfully')
      } catch (confirmError) {
        // User might already be confirmed, which is fine
        console.log('User might already be confirmed:', confirmError)
      }
    } else {
      // Disable user
      console.log('Disabling user:', userId)
      await cognito.adminDisableUser({
        UserPoolId: USER_POOL_ID!,
        Username: userId
      }).promise()
      console.log('User disabled successfully')
    }
  } catch (error) {
    console.error('Error updating user status in Cognito:', error)
    if (error instanceof Error) {
      throw new Error(`Error al actualizar estado del usuario: ${error.message}`)
    }
    throw new Error('Error al actualizar estado del usuario')
  }
}

// Update user plan (requires custom attribute to be created in Cognito first)
export async function updateUserPlan(userId: string, plan: 'monthly' | 'yearly' | 'free'): Promise<void> {
  try {
    console.log('Updating user plan:', userId, 'to:', plan)
    
    // Note: This requires the custom:plan attribute to be created in Cognito User Pool
    // To create it, go to AWS Console > Cognito > User Pools > Your Pool > Sign-up experience > Custom attributes
    // Add a custom attribute named "plan" with String type
    
    const attributes: CognitoIdentityServiceProvider.AttributeType[] = [
      {
        Name: 'custom:plan',
        Value: plan
      }
    ]

    console.log('Updating Cognito plan attribute:', attributes)

    const result = await cognito.adminUpdateUserAttributes({
      UserPoolId: USER_POOL_ID!,
      Username: userId,
      UserAttributes: attributes
    }).promise()

    console.log('User plan update successful:', result)

  } catch (error) {
    console.error('Error updating user plan in Cognito:', error)
    if (error instanceof Error) {
      throw new Error(`Error al actualizar plan del usuario: ${error.message}`)
    }
    throw new Error('Error al actualizar plan del usuario')
  }
}

// Get user statistics
export async function getUserStats(): Promise<{
  total: number
  active: number
  inactive: number
  pending: number
  monthlyPlan: number
}> {
  try {
    const response = await listUsers(
      { search: '', status: 'all', plan: 'all' },
      { page: 1, limit: 1000, total: 0 }
    )

    const users = response.users
    const total = users.length
    const active = users.filter(user => user.status === 'active').length
    const inactive = users.filter(user => user.status === 'inactive').length
    const pending = users.filter(user => user.status === 'pending').length
    const monthlyPlan = users.filter(user => user.plan === 'monthly').length

    return {
      total,
      active,
      inactive,
      pending,
      monthlyPlan
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw new Error('Error al obtener estadísticas')
  }
}

// Create a new user
export async function createUser(userData: {
  email: string
  firstName: string
  lastName: string
  phone: string
  plan: 'monthly' | 'yearly' | 'free'
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    console.log('Creating new user:', userData)
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '1!'
    
    // Create user attributes
    const attributes: CognitoIdentityServiceProvider.AttributeType[] = [
      {
        Name: 'email',
        Value: userData.email
      },
      {
        Name: 'given_name',
        Value: userData.firstName
      },
      {
        Name: 'family_name',
        Value: userData.lastName
      },
      {
        Name: 'phone_number',
        Value: userData.phone
      },
      {
        Name: 'email_verified',
        Value: 'true'
      }
    ]

    // Add plan attribute if it exists in the schema
    try {
      attributes.push({
        Name: 'custom:plan',
        Value: userData.plan
      })
    } catch (error) {
      console.log('Plan attribute not available, skipping...')
    }

    console.log('Creating user with attributes:', attributes)

    const result = await cognito.adminCreateUser({
      UserPoolId: USER_POOL_ID!,
      Username: userData.email,
      UserAttributes: attributes,
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS' // Don't send welcome email automatically
    }).promise()

    console.log('User created successfully:', result)

    await disableUser(userData.email);

    return {
      success: true,
      userId: result.User?.Username
    }

  } catch (error) {
    console.error('Error creating user in Cognito:', error)
    if (error instanceof Error) {
      return {
        success: false,
        error: `Error al crear usuario: ${error.message}`
      }
    }
    return {
      success: false,
      error: 'Error al crear usuario'
    }
  }
}

export async function disableUser(email: string) {
  await cognito.adminDisableUser({
    UserPoolId: USER_POOL_ID!,
    Username: email,
  }).promise();
} 