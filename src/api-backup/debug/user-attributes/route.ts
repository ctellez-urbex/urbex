import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
})

export async function GET(request: NextRequest) {
  try {
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

    console.log('🔍 Getting user attributes for:', email)

    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    })

    const response = await cognitoClient.send(command)
    
    console.log('🔍 Raw Cognito response:', response)

    // Extract all attributes
    const attributes: Record<string, string> = {}
    if (response.UserAttributes) {
      response.UserAttributes.forEach(attr => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value
        }
      })
    }

    const userInfo = {
      username: response.Username,
      status: response.UserStatus,
      enabled: response.Enabled,
      userCreateDate: response.UserCreateDate,
      userLastModifiedDate: response.UserLastModifiedDate,
      attributes: {
        email: attributes.email || '',
        given_name: attributes.given_name || '',
        family_name: attributes.family_name || '',
        name: attributes.name || '',
        phone_number: attributes.phone_number || '',
        'custom:su': attributes['custom:su'] || '',
        'custom:plan': attributes['custom:plan'] || '',
        // Include all other attributes for debugging
        ...attributes
      }
    }

    console.log('📊 Processed user info:', userInfo)

    return NextResponse.json({
      success: true,
      user: userInfo
    })

  } catch (error) {
    console.error('❌ Error getting user attributes:', error)
    
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