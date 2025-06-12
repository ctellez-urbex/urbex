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
});

export const metadata: Metadata = {
  title: "Urbex - Información Inmobiliaria",
  description: "Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida.",
  keywords: "inmobiliaria, propiedades, urbex, bienes raíces, información inmobiliaria",
  authors: [{ name: "Urbex Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
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
