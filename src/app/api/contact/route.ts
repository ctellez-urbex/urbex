import { NextResponse } from 'next/server';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

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
    return NextResponse.json(
      { message: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'El formato del correo electrónico no es válido' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailData = {
      from: `Urbex Contact Form <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `
        Nombre: ${name}
        Email: ${email}
        Teléfono: ${phone}
        
        Mensaje:
        ${message}
      `,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
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

    return NextResponse.json(
      { message: 'Mensaje enviado exitosamente' },
      { status: 200 }
    );
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
        return NextResponse.json(
          { message: 'Error de configuración del servidor' },
          { status: 500 }
        );
      }
      if (error.message.includes('domain')) {
        return NextResponse.json(
          { message: 'Error de configuración del servidor' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'Error al enviar el mensaje. Por favor, intenta de nuevo.' },
      { status: 500 }
    );
  }
} 