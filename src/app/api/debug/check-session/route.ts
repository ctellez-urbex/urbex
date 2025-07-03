import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
})

export async function GET(request: NextRequest) {
  try {
    // Get the current user's email from the request
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const userPoolId = process.env.AWS_USER_POOL_ID
    if (!userPoolId) {
      return NextResponse.json(
        { success: false, error: 'AWS_USER_POOL_ID not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Checking session for user:', email)

    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    })

    const response = await cognitoClient.send(command)
    
    console.log('🔍 Session check response:', response)

    const userInfo = {
      username: response.Username,
      status: response.UserStatus,
      enabled: response.Enabled,
      userCreateDate: response.UserCreateDate,
      userLastModifiedDate: response.UserLastModifiedDate,
    }

    console.log('📊 Session check result:', userInfo)

    return NextResponse.json({
      success: true,
      user: userInfo
    })

  } catch (error) {
    console.error('❌ Error checking session:', error)
    
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 