import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, attributes } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!attributes || typeof attributes !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Attributes object is required' },
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

    console.log('🔍 Updating user attributes for:', email)
    console.log('📋 Attributes to update:', attributes)

    // Convert attributes object to Cognito format
    const userAttributes = Object.entries(attributes).map(([name, value]) => ({
      Name: name,
      Value: String(value)
    }))

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: userAttributes
    })

    const response = await cognitoClient.send(command)
    
    console.log('✅ User attributes updated successfully:', response)

    return NextResponse.json({
      success: true,
      message: 'User attributes updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating user attributes:', error)
    
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