// src/components/layout/Header.tsx
import Link from 'next/link';
import styles from './Header.module.css';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { NavDropdown } from './NavDropdown'; // <-- Importa el nuevo componente

/**
 * El Header principal del sitio.
 * ¡Ahora es un Server Component!
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
      {/* 4. Este es el 'wrapper' que tendrá el estilo Glassmorfismo */}
      <div className={`${styles.wrapper} container`}>
        
        {/* --- NAVEGACIÓN (Izquierda) --- */}
        <nav className={styles.nav}>
          {/* 5. Reemplazamos el Link por el Dropdown */}
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

        {/* --- ACCIONES (Derecha) --- */}
        <div className={styles.actions}>
          
          {/* Icono de Búsqueda (TODO: Implementar modal) */}
          <button className={styles.iconButton} title="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          {/* Icono de Carrito */}
          <Link href="/carrito" className={styles.iconButton} title="Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </Link>
          
          {/* 6. Lógica condicional para Login/Cuenta */}
          {user ? (
            <>
              {/* Enlace a "Mi Cuenta" o "Admin" */}
              <Link 
                href={userRole === 'admin' ? '/admin' : '/mi-cuenta'} 
                className={styles.iconButton} 
                title={userRole === 'admin' ? 'Panel de Admin' : 'Mi Cuenta'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
              {/* Botón de Salir (ahora solo ícono) */}
              <SignOutButton />
            </>
          ) : (
            // Si no está logueado, mostrar enlaces de texto
            <>
              <Link href="/login" className={styles.navLink}>Login</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};