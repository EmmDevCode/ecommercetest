// src/components/admin/AdminHeader.tsx
"use client";

import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, ChevronRight } from 'lucide-react';
import styles from './AdminHeader.module.css';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const AdminHeader = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
  const pathname = usePathname();
  
  // Generar breadcrumbs simples basados en la URL
  // /admin/products/new -> Admin > Products > New
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const isLast = index === paths.length - 1;
      // Capitalizar primera letra
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return (
        <span key={path} className={styles.breadcrumbItem}>
          <span className={isLast ? styles.breadcrumbActive : styles.breadcrumbLink}>
            {label}
          </span>
          {!isLast && <ChevronRight size={14} className={styles.separator} />}
        </span>
      );
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Botón Toggle */}
        <button onClick={toggleSidebar} className={styles.toggleBtn}>
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Ruta / Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          {generateBreadcrumbs()}
        </nav>
      </div>

      <div className={styles.rightSection}>
        {/* Aquí podrías poner notificaciones o perfil */}
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  );
};