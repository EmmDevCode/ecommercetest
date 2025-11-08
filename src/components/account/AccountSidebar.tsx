// src/components/account/AccountSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import styles from './AccountSidebar.module.css';

// 1. Define tus enlaces de navegación
const navItems = [
  { href: '/mi-cuenta', label: 'Mis Pedidos' },
  { href: '/mi-cuenta/direcciones', label: 'Mis Direcciones' },
  // { href: '/mi-cuenta/perfil', label: 'Mi Perfil' }, // (Futuro)
];

export const AccountSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Mi Cuenta</h3>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              className={`
                ${styles.navLink}
                ${pathname === item.href ? styles.active : ''}
              `}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Añadimos el botón de cerrar sesión aquí */}
      <div className={styles.signOutWrapper}>
        <SignOutButton />
      </div>
    </aside>
  );
};