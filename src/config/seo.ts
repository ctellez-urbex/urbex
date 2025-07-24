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
    email: 'alejandro@urbex.com.co',
    phone: '+57-310-8780-049',
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
    'inversión inmobiliaria',
    'propiedades comerciales',
    'propiedades residenciales',
    'desarrollo inmobiliario',
    'consultoría inmobiliaria',
    'brokeraje inmobiliario',
    'estructuración financiera',
    'expansión inmobiliaria'
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
  },

  // Structured Data
  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Urbex",
      "url": "https://urbex.com.co",
      "logo": "https://urbex.com.co/images/urbex-logo.svg",
      "description": "Plataforma especializada en información inmobiliaria en Colombia",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CO",
        "addressLocality": "Colombia"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "info@urbex.com.co"
      },
      "sameAs": [
        "https://www.facebook.com/urbex",
        "https://www.linkedin.com/company/urbex",
        "https://www.instagram.com/urbex"
      ]
    },
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Urbex",
      "url": "https://urbex.com.co",
      "description": "Plataforma especializada en información inmobiliaria",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://urbex.com.co/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    realEstate: {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Urbex",
      "description": "Servicios de información inmobiliaria en Colombia",
      "url": "https://urbex.com.co",
      "areaServed": {
        "@type": "Country",
        "name": "Colombia"
      },
      "serviceType": [
        "Información Inmobiliaria",
        "Consultoría Inmobiliaria",
        "Brokeraje Inmobiliario",
        "Estructuración Financiera"
      ]
    }
  },

  // Performance optimizations
  performance: {
    preloadFonts: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ],
    preconnectDomains: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cognito-idp.us-east-2.amazonaws.com',
      'https://api.mailgun.net'
    ],
    dnsPrefetch: [
      '//cognito-idp.us-east-2.amazonaws.com',
      '//api.mailgun.net'
    ]
  }
}; 