// src/components/layout/AuthDropdown.tsx
"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Asegúrate de importar los NUEVOS estilos
import styles from './AuthDropdown.module.css'; 

interface AuthDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDropdown = ({ isOpen, onClose }: AuthDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        // 2. Ya no hay overlay, solo el cuerpo del dropdown
        <motion.div 
          className={styles.dropdownBody}
          // 3. Animación de "pop" desde arriba
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* 4. Estructura como en tu foto */ }
          <Link href="/login" className={styles.dropdownLink} onClick={onClose}>
            iniciar sesion
          </Link>
          <div className={styles.separator}></div>
          <Link href="/register" className={styles.dropdownLink} onClick={onClose}>
            registrarse
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};