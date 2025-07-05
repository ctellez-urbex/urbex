import { NextResponse } from 'next/server';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { validateApiKeyForRoute, createSuccessResponse, createErrorResponse, validateRequiredFields, validateEmail, logApiRequest, logApiResponse } from '../../lib/api-utils';

// Initialize Mailgun client
const mailgun = new Mailgun(formData);

// Create Mailgun client only if API key is available
const mg = process.env.MAILGUN_API_KEY 
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

export async function POST(request: Request) {
  // Log API request for debugging
  logApiRequest(request as any, 'Contact Form');
  
  // Validate API key (optional for contact form - you can set skipAuth: true if you want it public)
  const authError = validateApiKeyForRoute(request as any, { 
    apiKeyType: 'API_KEY',
    skipAuth: false // Set to true if you want contact form to be public
  });
  
  if (authError) {
    logApiResponse(authError, 'Contact Form - Auth Failed');
    return authError;
  }

  // Log environment variables (without exposing sensitive data)
  console.log('Environment check:', {
    hasMailgunKey: !!process.env.MAILGUN_API_KEY,
    hasDomain: !!process.env.MAILGUN_DOMAIN,
    hasContactEmail: !!process.env.CONTACT_EMAIL,
    domain: process.env.MAILGUN_DOMAIN,
    contactEmail: process.env.CONTACT_EMAIL
  });

  // Check if Mailgun is configured
  if (!mg || !process.env.MAILGUN_DOMAIN || !process.env.CONTACT_EMAIL) {
    console.error('Mailgun configuration missing:', {
      hasClient: !!mg,
      hasDomain: !!process.env.MAILGUN_DOMAIN,
      hasEmail: !!process.env.CONTACT_EMAIL
    });
    return createErrorResponse(
      'Error de configuración del servidor',
      'MAILGUN_CONFIG_MISSING',
      500
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    const requiredFieldsError = validateRequiredFields(body, ['name', 'email', 'phone', 'message']);
    if (requiredFieldsError) {
      const response = createErrorResponse(requiredFieldsError, 'MISSING_FIELDS', 400);
      logApiResponse(response, 'Contact Form - Validation Failed');
      return response;
    }

    // Validate email format
    if (!validateEmail(email)) {
      const response = createErrorResponse(
        'El formato del correo electrónico no es válido',
        'INVALID_EMAIL',
        400
      );
      logApiResponse(response, 'Contact Form - Validation Failed');
      return response;
    }

    // Prepare email content
    const emailData = {
      from: `Urbex <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nuevo mensaje de contacto de ${name} desde la landing page`,
      text: `
        Nombre: ${name}
        Email: ${email}
        Teléfono: ${phone}
        
        Mensaje:
        ${message}
      `,
      html: `
        <h2>Nuevo mensaje de contacto desde la landing page</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    console.log('Attempting to send email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      domain: process.env.MAILGUN_DOMAIN
    });

    // Send email using Mailgun
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    
    console.log('Email sent successfully:', {
      id: result.id,
      message: result.message
    });

    const response = createSuccessResponse(
      { id: result.id, message: result.message },
      'Mensaje enviado exitosamente',
      200
    );
    logApiResponse(response, 'Contact Form - Success');
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.message.includes('API key')) {
        const response = createErrorResponse(
          'Error de configuración del servidor',
          'MAILGUN_API_ERROR',
          500
        );
        logApiResponse(response, 'Contact Form - Mailgun Error');
        return response;
      }
      if (error.message.includes('domain')) {
        const response = createErrorResponse(
          'Error de configuración del servidor',
          'MAILGUN_DOMAIN_ERROR',
          500
        );
        logApiResponse(response, 'Contact Form - Mailgun Error');
        return response;
      }
    }
    
    const response = createErrorResponse(
      'Error al enviar el mensaje. Por favor, intenta de nuevo.',
      'EMAIL_SEND_ERROR',
      500
    );
    logApiResponse(response, 'Contact Form - General Error');
    return response;
  }
} 