export const seoConfig = {
  // Basic site information
  siteUrl: 'https://urbex.com.co',
  siteName: 'Urbex',
  siteTitle: 'Urbex - Información Inmobiliaria | Propiedades y Bienes Raíces en Colombia',
  siteDescription: 'Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida. Bienes raíces en Colombia.',
  
  // Social media
  social: {
    twitter: '@urbex_co',
    facebook: 'https://www.facebook.com/urbex',
    linkedin: 'https://www.linkedin.com/company/urbex',
    instagram: 'https://www.instagram.com/urbex'
  },
  
  // Contact info
  contact: {
    email: 'info@urbex.com.co',
    phone: '+57-XXX-XXX-XXXX',
    address: {
      country: 'Colombia',
      locality: 'Colombia'
    }
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || '',
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  
  // Keywords
  keywords: [
    'inmobiliaria',
    'propiedades Colombia', 
    'bienes raíces',
    'lotes',
    'información inmobiliaria',
    'urbex',
    'propiedades en venta',
    'real estate Colombia',
    'finca raíz',
    'inversión inmobiliaria'
  ],
  
  // Open Graph defaults
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Urbex',
    images: {
      default: '/images/og-image.jpg',
      width: 1200,
      height: 630
    }
  }
}; 