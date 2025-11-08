import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- 1. Importa tus nuevos componentes ---
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi E-Commerce con Next.js",
  description: "La mejor tienda para tus compras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        
        {/* --- 2. Añade el Header aquí --- */}
        <Header />
        
        {/* Añadimos un 'main' con un estilo mínimo 
          para empujar el footer hacia abajo.
        */}
        <main className="container" style={{ minHeight: 'calc(100vh - 150px)' }}>
          {/* '150px' es un cálculo apróximado de header + footer */}
          {children}
        </main>
        
        {/* --- 3. Añade el Footer aquí --- */}
        <Footer />

        {/* --- 3. Añade el Toaster aquí --- 
           richColors aplica estilos automáticos para éxito y error.
           position="bottom-right" lo coloca donde pediste.
        */}
        <Toaster position="bottom-right" richColors />

      </body>
    </html>
  );
}