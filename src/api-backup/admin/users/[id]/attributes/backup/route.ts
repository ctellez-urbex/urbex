import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider'

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
    const { id } = await params
    const { attributes } = await request.json()

    console.log('🔍 Updating user attributes:', id, attributes)

    const cognitoAttributes: any[] = []
    
    // Add standard attributes
    if (attributes.given_name) {
      cognitoAttributes.push({
        Name: 'given_name',
        Value: attributes.given_name
      })
    }
    
    if (attributes.family_name) {
      cognitoAttributes.push({
        Name: 'family_name',
        Value: attributes.family_name
      })
    }
    
    if (attributes.phone_number) {
      cognitoAttributes.push({
        Name: 'phone_number',
        Value: attributes.phone_number
      })
    }

    // Add custom attributes
    if (attributes.custom_su !== undefined) {
      cognitoAttributes.push({
        Name: 'custom:su',
        Value: attributes.custom_su.toString()
      })
    }
    
    if (attributes.custom_plan) {
      cognitoAttributes.push({
        Name: 'custom:plan',
        Value: attributes.custom_plan
      })
    }

    console.log('🔍 Cognito attributes to update:', cognitoAttributes)

    const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID!,
      Username: id,
      UserAttributes: cognitoAttributes
    })
    
    const result = await cognito.send(updateAttributesCommand)

    console.log('✅ User attributes updated successfully:', result)

    return NextResponse.json({ 
      message: 'Atributos del usuario actualizados correctamente',
      userId: id 
    })

  } catch (error) {
    console.error('❌ Error updating user attributes:', error)
    return NextResponse.json(
      { error: 'Error al actualizar atributos del usuario' },
      { status: 500 }
    )
  }
} 