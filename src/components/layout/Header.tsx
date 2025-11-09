// src/components/layout/Header.tsx
import Link from 'next/link';
import styles from './Header.module.css';
import { createClient } from '@/lib/supabase/server';
import { NavDropdown } from './NavDropdown';
import { HeaderActions } from './HeaderActions';
import { MobileNav } from './MobileNav';

/**
 * El Header principal del sitio.
 * ¡Sigue siendo un Server Component!
 */
export const Header = async () => {
  const supabase = await createClient();

  // 1. Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Obtenemos el perfil (para saber si es admin)
  let userRole = 'user';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) userRole = profile.role;
  }
  
  // 3. ¡NUEVO! Cargamos las categorías en el servidor
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name', { ascending: true });

  return (
    <header className={styles.header}>
      {/* --- 1. NAVEGACIÓN DE ESCRITORIO --- */}
      {/* Esta es la barra que se OCULTARÁ en móvil */}
      <div className={`${styles.wrapper} ${styles.desktopNav} container`}>
        <nav className={styles.nav}>
          <NavDropdown title="productos" categories={categories || []} />
          <Link href="/reseñas" className={styles.navLink}>
            Reseñas
          </Link>
          <Link href="/sobre-nosotros" className={styles.navLink}>
            Sobre nosotros
          </Link>
        </nav>
        {/* --- LOGO (Centro) --- */}
        <Link href="/" className={styles.logo}>
          LOGO
        </Link>

        {/* --- 6. REEMPLAZO --- */}
        {/* Reemplazamos todo el <div> de acciones por
            nuestro nuevo componente cliente, pasándole
            los datos que cargamos en el servidor. */}
        <HeaderActions user={user} userRole={userRole} />
      </div>
      {/* --- 2. NAVEGACIÓN MÓVIL --- */}
      {/* Este componente solo será VISIBLE en móvil */}
      <MobileNav 
        user={user}
        userRole={userRole}
        categories={categories || []}
      />
    </header>
  );
};