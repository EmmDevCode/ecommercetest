import type { Metadata } from "next";
import "./globals.css";

// --- 1. Importa tus nuevos componentes ---
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from 'sonner';
import localFont from "next/font/local"; 

// 2. Configura la familia de fuentes con TUS archivos
const interDisplay = localFont({
  src: [
    {
      path: './fonts/InterDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/InterDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap', // Muestra una fuente de sistema mientras carga la tuya
});

export const metadata: Metadata = {
  title: "Mi E-Commerce con Next.js",
  description: "La mejor tienda para tus compras.",
};

// 3. ¡EL CAMBIO MÁS IMPORTANTE!
// Añadimos 'modal' a las props del layout
export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={interDisplay.className}>
        {/* El modal se renderiza aquí, en el nivel más alto */}
        {modal}
        
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}