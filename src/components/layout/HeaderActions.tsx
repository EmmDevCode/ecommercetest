// src/components/layout/HeaderActions.tsx
"use client";

import { useState, useRef, useEffect} from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { AuthDropdown } from './AuthDropdown'; // Lo crearemos en el paso 2
import { SearchModal } from './SearchModal'; // Lo crearemos en el paso 3
import styles from './Header.module.css';

// 1. Definimos los tipos que recibimos del Server Component
type User = {
  id: string;
  email?: string;
} | null;

interface HeaderActionsProps {
  user: User;
  userRole: string;
}

export const HeaderActions = ({ user, userRole }: HeaderActionsProps) => {
  const router = useRouter();
  
  // 2. Estados para controlar ambos modales
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const authWrapperRef = useRef<HTMLDivElement>(null);

  const handleAccountClick = () => {
    if (user) {
      const href = userRole === 'admin' ? '/admin' : '/mi-cuenta';
      router.push(href);
    } else {
      setIsAuthOpen(prev => !prev); 
    }
  };

  // 3. ESTE ES EL HOOK "CLICK AFUERA"
  useEffect(() => {
    // Solo se ejecuta si el dropdown está abierto
    if (!isAuthOpen) return;

    function handleClickOutside(event: MouseEvent) {
      // Si el click fue *fuera* del contenedor (ref)...
      if (authWrapperRef.current && !authWrapperRef.current.contains(event.target as Node)) {
        setIsAuthOpen(false); // ...ciérralo
      }
    }

    // Añade el "oyente" cuando el modal se abre
    document.addEventListener("mousedown", handleClickOutside);
    
    // Limpia el "oyente" cuando el modal se cierra
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAuthOpen]); // Se ejecuta cada vez que 'isAuthOpen' cambia

  return (
    <>
      <div className={styles.actions}>
        {/* --- Icono de Búsqueda --- */}
        <button 
          className={styles.iconButton} 
          title="Buscar"
          onClick={() => setIsSearchOpen(true)} // <-- Abre el modal de búsqueda
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        {/* --- Icono de Carrito (Sin cambios) --- */}
        <Link href="/carrito" className={styles.iconButton} title="Carrito">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </Link>
        
        {/* --- Lógica de Icono de Cuenta / Login --- */}
        <div className={styles.authWrapper} ref={authWrapperRef}>
        <button 
          className={styles.iconButton} 
          title={user ? (userRole === 'admin' ? 'Panel de Admin' : 'Mi Cuenta') : 'Iniciar Sesión'}
          onClick={handleAccountClick} // <-- Lógica unificada
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>

        <AuthDropdown 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
          />
        </div>

        {/* --- Botón de Salir (Solo si está logueado) --- */}
        {user && <SignOutButton />}
      </div>

      {/* 4. Los Modales (se renderizan fuera del DOM, pero se controlan aquí) */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />  
    </>
  );
};