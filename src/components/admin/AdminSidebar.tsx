// src/components/admin/AdminSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Layers, Settings, 
  ChevronDown, ChevronRight, Store, LogOut // Importamos el icono Store
} from 'lucide-react';
import styles from './AdminSidebar.module.css';
import { SignOutButton } from '../auth/SignOutButton'; // O tu botón de logout

interface SidebarProps {
  isOpen: boolean;
}

const menuGroups = [
  {
    title: "PRINCIPAL",
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: "CATÁLOGO",
    items: [
      { 
        label: 'Productos', 
        icon: Package,
        subItems: [
          { href: '/admin/products', label: 'Todos los productos' },
          { href: '/admin/products/new', label: 'Nuevo producto' },
          { href: '/admin/attributes', label: 'Atributos' },
        ]
      },
      { href: '/admin/categories', label: 'Categorías', icon: Layers },
    ]
  },
  {
    title: "VENTAS",
    items: [
      { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    ]
  },
];

export const AdminSidebar = ({ isOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Productos']); 

  const toggleMenu = (label: string) => {
    if (!isOpen) return;
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
      {/* 1. Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>A</div>
        {isOpen && <span className={styles.logoText}>Admin Panel</span>}
      </div>

      {/* 2. Menú con Scroll (Empuja el footer hacia abajo) */}
      <div className={styles.scrollableContent}>
        {menuGroups.map((group, idx) => (
          <div key={idx} className={styles.group}>
            {isOpen && <h4 className={styles.groupTitle}>{group.title}</h4>}
            <ul className={styles.navList}>
              {group.items.map((item: any) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isMenuOpen = openMenus.includes(item.label);
                const isParentActive = hasSubItems && item.subItems.some((sub: any) => pathname === sub.href);
                const isSingleActive = !hasSubItems && pathname === item.href;

                return (
                  <li key={item.label}>
                    {hasSubItems ? (
                      <div className={styles.menuWrapper}>
                        <button 
                          onClick={() => toggleMenu(item.label)}
                          className={`${styles.navLink} ${isParentActive ? styles.activeParent : ''}`}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                          {isOpen && (
                            <>
                              <span className={styles.linkLabel}>{item.label}</span>
                              <span className={styles.chevron}>
                                {isMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                              </span>
                            </>
                          )}
                        </button>
                        
                        {isOpen && isMenuOpen && (
                          <ul className={styles.subMenu}>
                            {item.subItems.map((sub: any) => (
                              <li key={sub.href}>
                                <Link 
                                  href={sub.href}
                                  className={`${styles.subLink} ${pathname === sub.href ? styles.activeSub : ''}`}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link 
                        href={item.href}
                        className={`${styles.navLink} ${isSingleActive ? styles.active : ''}`}
                      >
                        <Icon size={20} strokeWidth={1.5} />
                        {isOpen && <span className={styles.linkLabel}>{item.label}</span>}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* 3. Footer (AQUÍ VA EL BOTÓN "VOLVER A LA TIENDA") */}
      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.footerLink}>
          <Store size={20} />
          {isOpen && <span>Volver a la Tienda</span>}
        </Link>
        
        {/* Botón Logout (Ejemplo visual) */}
        <button className={styles.footerLink}>
          <LogOut size={20} />
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};