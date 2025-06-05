import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteHandler from "@/components/layout/route-handler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urbex - Información Inmobiliaria",
  description: "Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <RouteHandler>{children}</RouteHandler>
      </body>
    </html>
  );
}
