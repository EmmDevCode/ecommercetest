// src/app/(account)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import styles from './account-layout.module.css';

/**
 * Este es el Layout RAÍZ para todas las rutas de /mi-cuenta
 * Protege todas las rutas hijas para que solo usuarios logueados entren.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // --- 1. COMPROBACIÓN DE SEGURIDAD CENTRALIZADA ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Si no hay usuario, lo redirigimos al login
  if (!user) {
    redirect('/login');
  }
  // --- Fin de la comprobación ---

  // 2. Renderiza el layout del panel de cuenta
  return (
    // Usaremos el layout principal (Header/Footer)
    // y solo añadiremos el sidebar + contenido
    <div className="container" style={{padding: '2rem 1rem'}}>
      <div className={styles.accountLayout}>
        <AccountSidebar />
        <main className={styles.accountContent}>
          {children}
        </main>
      </div>
    </div>
  );
}