import Link from 'next/link';
import styles from './Header.module.css';
import { createClient } from '@/lib/supabase/server'; // Cliente de SERVIDOR
// ⚠️ ELIMINA esta línea - ya no necesitas cookies
// import { cookies } from 'next/headers';
import { SignOutButton } from '@/components/auth/SignOutButton';

/**
 * El Header principal del sitio.
 * ¡Ahora es un Server Component!
 */
export const Header = async () => {
  // ⚠️ ELIMINA esta línea
  // const cookieStore = cookies();
  
  // ⚠️ ACTUALIZA: usa await con createClient()
  const supabase = await createClient();

  // 1. Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // 2. (Opcional pero recomendado) Obtenemos el perfil para saber si es admin
  let userRole = 'user'; // Por defecto
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      userRole = profile.role;
    }
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.wrapper} container`}>
        
        <Link href="/" className={styles.logo}>
          Mi E-Commerce
        </Link>

        {/* --- NAVEGACIÓN PRINCIPAL --- */}
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/productos">Productos</Link>
            </li>
            {/* 3. Mostramos "Admin" solo si el rol es 'admin' */}
            {userRole === 'admin' && (
              <li>
                <Link href="/admin/products/new">Admin</Link>
              </li>
            )}
          </ul>
        </nav>

        {/* --- ACCIONES DE USUARIO --- */}
        <div className={styles.actions}>
          <Link href="/carrito" className={styles.cartLink}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 640 512"
      width="20" 
      height="20"
      fill="currentColor"
      className={styles.cartIcon}
    >
      <path d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
    </svg>
  </Link>
     
          {/* 4. Lógica condicional */}
          {user ? (
            // Si el usuario ESTÁ logueado
            <>
      <Link href="/mi-cuenta" className={styles.accountLink}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512"
          width="18" 
          height="18"
          fill="currentColor"
          className={styles.userIcon}
        >
          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7c0-98.5-79.8-178.3-178.3-178.3l-91.4 0z"/>
        </svg>
      </Link>
      <SignOutButton />
    </>
          ) : (
            // Si el usuario NO está logueado
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Registro</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};