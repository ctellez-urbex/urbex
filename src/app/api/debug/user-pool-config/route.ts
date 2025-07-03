import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, DescribeUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const USER_POOL_ID = process.env.AWS_USER_POOL_ID

export async function GET() {
  try {
    console.log('🔍 Debug: Getting User Pool configuration for:', USER_POOL_ID)

    // Get User Pool details
    const describeUserPoolCommand = new DescribeUserPoolCommand({
      UserPoolId: USER_POOL_ID!
    })
    
    const result = await cognito.send(describeUserPoolCommand)

    console.log('🔍 Debug: User Pool configuration:', result)

    // Extract schema information
    const schema = result.UserPool?.SchemaAttributes || []
    const customAttributes = schema.filter((attr: any) => attr.Name?.startsWith('custom:'))
    const standardAttributes = schema.filter((attr: any) => !attr.Name?.startsWith('custom:'))

    console.log('🔍 Debug: Custom attributes:', customAttributes)
    console.log('🔍 Debug: Standard attributes:', standardAttributes)

    return NextResponse.json({
      success: true,
      userPool: {
        id: result.UserPool?.Id,
        name: result.UserPool?.Name,
        status: result.UserPool?.Status,
        schema: {
          custom: customAttributes.map((attr: any) => ({
            name: attr.Name,
            type: attr.AttributeDataType,
            required: attr.Required,
            mutable: attr.Mutable
          })),
          standard: standardAttributes.map((attr: any) => ({
            name: attr.Name,
            type: attr.AttributeDataType,
            required: attr.Required,
            mutable: attr.Mutable
          }))
        }
      }
    })

  } catch (error) {
    console.error('❌ Debug: Error getting User Pool configuration:', error)
    return NextResponse.json(
      { 
        error: 'Error getting User Pool configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 