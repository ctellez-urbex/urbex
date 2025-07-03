import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { generateVerificationCode, storeVerificationCode } from '@/lib/auth/verification-store';

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
});

const USER_POOL_ID = process.env.AWS_USER_POOL_ID;

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Processing forgot password request for:', email);
    console.log('USER_POOL_ID:', USER_POOL_ID);
    console.log('AWS_REGION:', process.env.AWS_REGION);

    // Check if user exists in Cognito
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      });

      console.log('Sending AdminGetUserCommand...');
      const userResult = await cognitoClient.send(getUserCommand);
      console.log('User result:', {
        UserStatus: userResult.UserStatus,
        AttributesCount: userResult.UserAttributes?.length
      });
      
      // Check if user is confirmed
      if (userResult.UserStatus !== 'CONFIRMED') {
        console.log('User not confirmed, status:', userResult.UserStatus);
        return NextResponse.json(
          { success: false, error: 'User account is not confirmed. Please verify your email first.' },
          { status: 400 }
        );
      }

      // Check if user has verified email
      const emailAttribute = userResult.UserAttributes?.find((attr: any) => attr.Name === 'email_verified');
      console.log('Email verification attribute:', emailAttribute?.Value);
      
      if (emailAttribute?.Value !== 'true') {
        console.log('Email not verified, value:', emailAttribute?.Value);
        return NextResponse.json(
          { success: false, error: 'Email is not verified. Please verify your email first.' },
          { status: 400 }
        );
      }

      console.log('User validation passed');

    } catch (error: any) {
      console.error('Cognito error:', error);
      
      if (error.name === 'UserNotFoundException') {
        return NextResponse.json(
          { success: false, error: 'No account found with this email address' },
          { status: 404 }
        );
      }
      
      if (error.name === 'NotAuthorizedException') {
        return NextResponse.json(
          { success: false, error: 'Access denied. Please check your AWS credentials.' },
          { status: 403 }
        );
      }
      
      if (error.name === 'InvalidParameterException') {
        return NextResponse.json(
          { success: false, error: 'Invalid user pool configuration.' },
          { status: 400 }
        );
      }
      
      throw error;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log('Generated verification code for:', email);
    
    // Store the code
    storeVerificationCode(email, verificationCode, 15); // 15 minutes

    // Send email using Mailgun
    if (!mg || !process.env.MAILGUN_DOMAIN) {
      console.error('Mailgun not configured:', {
        hasMailgun: !!mg,
        hasDomain: !!process.env.MAILGUN_DOMAIN
      });
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const emailData = {
      from: `Urbex <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Password Reset Code - Urbex',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Urbex</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Plataforma de Análisis Inmobiliario</p>
          </div>
          
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Solicitud de Restablecimiento de Contraseña</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hola,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Has solicitado restablecer tu contraseña para tu cuenta de Urbex. Para continuar con el proceso, utiliza el siguiente código de verificación:
            </p>
            
            <div style="background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
              <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 12px; margin: 0; font-weight: bold;">${verificationCode}</h1>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              <strong>Este código expirará en 15 minutos.</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/forgot-password?email=${encodeURIComponent(email)}&step=code" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Ir a la página de restablecimiento
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Importante:</strong> Si no solicitaste este restablecimiento de contraseña, puedes ignorar este correo de forma segura.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
              Saludos,<br>
              <strong>El Equipo de Urbex</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
    };

    console.log('Sending email via Mailgun...');
    await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    console.log('Email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 