'use client'

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Urbex",
    "alternateName": "Urbex Inmobiliaria",
    "description": "Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida.",
    "url": "https://urbex.com.co",
    "logo": "https://urbex.com.co/images/urbex-logo.svg",
    "image": "https://urbex.com.co/images/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CO",
      "addressLocality": "Colombia"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Colombia"
    },
    "serviceType": "Real Estate Services",
    "priceRange": "$$",
    "telephone": "+57-XXX-XXX-XXXX",
    "email": "info@urbex.com.co",
    "foundingDate": "2024",
    "sameAs": [
      "https://www.facebook.com/urbex",
      "https://www.linkedin.com/company/urbex",
      "https://www.instagram.com/urbex"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Urbex",
    "alternateName": "Urbex Inmobiliaria",
    "url": "https://urbex.com.co",
    "description": "Plataforma especializada en información inmobiliaria en Colombia",
    "inLanguage": "es-CO",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://urbex.com.co/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://urbex.com.co"
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Servicios de Información Inmobiliaria",
    "description": "Acceso completo a información de propiedades y lotes en Colombia",
    "provider": {
      "@type": "Organization",
      "name": "Urbex"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Colombia"
    },
    "serviceType": "Real Estate Information Services"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  );
} 