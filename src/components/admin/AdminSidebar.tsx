// src/components/admin/AdminSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

// 1. Define tus enlaces de navegación
const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/categories', label: 'Categorías' },
  { href: '/admin/attributes', label: 'Atributos' },
  { href: '/admin/products/new', label: 'Añadir Producto' },
  // { href: '/admin/users', label: 'Clientes' }, // (Futuro)
];

export const AdminSidebar = () => {
  const pathname = usePathname(); // Hook para saber la ruta activa

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        Admin Panel
      </div>
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
    </nav>
  );
};