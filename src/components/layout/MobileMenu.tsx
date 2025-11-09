// src/components/layout/MobileMenu.tsx
"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 1. IMPORTAMOS LOS NUEVOS ESTILOS
import styles from './MobileMenu.module.css'; 

// Tipos (puedes moverlos a un archivo 'types.ts' global)
type User = { id: string; email?: string } | null;
type Category = { name: string; slug: string };

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userRole: string;
  categories: Category[];
}

// Icono de X (Cerrar)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const MobileMenu = ({ isOpen, onClose, user, userRole, categories }: MobileMenuProps) => {
  
  const handleLinkClick = (path: string) => {
    // Cierra el menú antes de navegar
    onClose();
    // (Next.js/Link se encargará de la navegación)
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.modalBody}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* --- Header del Menú (Logo + Cerrar) --- */}
            <div className={styles.menuHeader}>
              <span className={styles.menuLogo}>LOGO</span>
              <button onClick={onClose} className={styles.closeButton}>
                <CloseIcon />
              </button>
            </div>

            {/* --- Links de Navegación --- */}
            <nav className={styles.nav}>
              <h3 className={styles.navSectionTitle}>Navegación</h3>
              <Link href="/productos" className={styles.navLink} onClick={onClose}>Productos</Link>
              <Link href="/reseñas" className={styles.navLink} onClick={onClose}>Reseñas</Link>
              <Link href="/sobre-nosotros" className={styles.navLink} onClick={onClose}>Sobre nosotros</Link>
              
              <h3 className={styles.navSectionTitle}>Categorías</h3>
              {categories.map(cat => (
                <Link key={cat.slug} href={`/categoria/${cat.slug}`} className={styles.navLinkIndent} onClick={onClose}>
                  {cat.name}
                </Link>
              ))}

              <h3 className={styles.navSectionTitle}>Mi Cuenta</h3>
              {/* Tal como pediste, ¡sin el buscador! */}
              <Link href="/carrito" className={styles.navLink} onClick={onClose}>
                🛒 Carrito
              </Link>
              
              {user ? (
                <Link href={userRole === 'admin' ? '/admin' : '/mi-cuenta'} className={styles.navLink} onClick={onClose}>
                  👤 Mi Cuenta
                </Link>
              ) : (
                <Link href="/login" className={styles.navLink} onClick={onClose}>
                  👤 Iniciar Sesión
                </Link>
              )}
            </nav>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};