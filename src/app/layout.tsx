import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import RouteHandler from "@/components/layout/route-handler";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "Urbex - Información Inmobiliaria | Propiedades y Bienes Raíces en Colombia",
    template: "%s | Urbex"
  },
  description: "Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida. Bienes raíces en Colombia.",
  keywords: [
    "inmobiliaria",
    "propiedades Colombia", 
    "bienes raíces",
    "lotes",
    "información inmobiliaria",
    "urbex",
    "propiedades en venta",
    "real estate Colombia"
  ],
  authors: [{ name: "Urbex Team", url: "https://urbex.com.co" }],
  creator: "Urbex",
  publisher: "Urbex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://urbex.com.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Urbex - Información Inmobiliaria | Propiedades Colombia",
    description: "Plataforma especializada en información inmobiliaria. Accede a toda la información de propiedades y lotes en Colombia de forma fácil y rápida.",
    url: "https://urbex.com.co",
    siteName: "Urbex",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Urbex - Información Inmobiliaria",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urbex - Información Inmobiliaria",
    description: "Plataforma especializada en información inmobiliaria en Colombia.",
    images: ["/images/og-image.jpg"],
    creator: "@urbex_co",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  other: {
    "X-DNS-Prefetch-Control": "on",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//cognito-idp.us-east-2.amazonaws.com" />
        <link rel="dns-prefetch" href="//api.mailgun.net" />
        
        {/* Performance meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <RouteHandler>{children}</RouteHandler>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
