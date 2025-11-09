// src/components/layout/MobileNav.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css'; // Reutilizamos estilos del header
import { MobileMenu } from './MobileMenu'; // El panel lateral que crearemos

// Definimos los tipos que recibimos del Server Component
type User = { id: string; email?: string } | null;
type Category = { name: string; slug: string };

interface MobileNavProps {
  user: User;
  userRole: string;
  categories: Category[];
}

// Icono de Hamburguesa (X)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const MobileNav = ({ user, userRole, categories }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={styles.mobileNav}>
        {/* 1. Botón de Hamburguesa */}
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </button>

        {/* 2. Logo */}
        <Link href="/" className={styles.mobileLogo}>
          LOGO
        </Link>
        
        {/* 3. Espaciador (para centrar el logo correctamente) */}
        <div style={{ width: '44px' }}></div> 
      </div>

      {/* 4. El Panel Lateral (Drawer) */}
      <MobileMenu 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        userRole={userRole}
        categories={categories}
      />
    </>
  );
};