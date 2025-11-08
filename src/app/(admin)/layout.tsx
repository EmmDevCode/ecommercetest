// src/app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import styles from './admin-layout.module.css';

/**
 * Este es el Layout RAÍZ para todas las rutas de /admin
 * Protege todas las rutas hijas
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // --- 1. COMPROBACIÓN DE SEGURIDAD CENTRALIZADA ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    notFound(); // O redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  // Si no es admin, no puede ver NADA de este layout
  if (profile?.role !== 'admin') {
    notFound(); // Muestra un 404
  }
  // --- Fin de la comprobación ---


  // 2. Renderiza el layout del panel
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.adminContent}>
        {children}
      </main>
    </div>
  );
}