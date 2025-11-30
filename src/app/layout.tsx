import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import localFont from "next/font/local"; 

// ... (MANTÉN TU CONFIGURACIÓN DE FUENTES IGUAL) ...
const interDisplay = localFont({
  src: [
    { path: './fonts/InterDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/InterDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mi E-Commerce",
  description: "Tienda online",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* QUITAMOS Header y Footer de aquí. Solo dejamos el body limpio. */}
      <body className={interDisplay.className}>
        {modal}
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}