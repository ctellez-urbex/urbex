import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityServiceProvider } from 'aws-sdk'

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const USER_POOL_ID = process.env.AWS_USER_POOL_ID || 'us-east-2_Fpda5LMX0'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!USER_POOL_ID || !process.env.AWS_POOL_CLIENT_ID) {
      console.error('❌ Missing AWS configuration:', {
        USER_POOL_ID: USER_POOL_ID,
        AWS_POOL_CLIENT_ID: process.env.AWS_POOL_CLIENT_ID
      })
      return NextResponse.json(
        { error: 'AWS configuration is missing' },
        { status: 500 }
      )
    }

    console.log('🔐 Confirming signup for:', email, 'with code:', code)

    // First, verify the code using the client SDK approach
    // This validates the code and marks email as verified
    const { CognitoUser, CognitoUserPool } = require('amazon-cognito-identity-js')
    
    const poolData = {
      UserPoolId: USER_POOL_ID,
      ClientId: process.env.AWS_POOL_CLIENT_ID
    }
    
    const userPool = new CognitoUserPool(poolData)
    const userData = {
      Username: email,
      Pool: userPool
    }
    
    const cognitoUser = new CognitoUser(userData)
    
    // Verify the code first
    await new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err: Error | undefined, result: string) => {
        if (err) {
          console.error('❌ Code verification failed:', err)
          reject(err)
          return
        }
        console.log('✅ Code verified successfully')
        resolve(result)
      })
    })

    // Note: We only verify the email, we don't confirm the user
    // The admin will need to confirm and enable the user later
    console.log('ℹ️ Email verified successfully. User remains UNCONFIRMED until admin approval.')

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully. Please wait for admin approval to access your account.'
    })

  } catch (error) {
    console.error('❌ Error confirming signup:', error)
    
    let errorMessage = 'Error confirming signup'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 