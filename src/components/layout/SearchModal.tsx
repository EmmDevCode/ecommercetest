// src/components/layout/SearchModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
// 1. IMPORTANTE: Importa los estilos
import styles from './SearchModal.module.css'; 

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");

  // Auto-enfocar el input cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      document.getElementById('search-input')?.focus();
    }
  }, [isOpen]);

  // TODO: Implementar lógica de búsqueda
  // const searchResults = useSearch(query); 

  return (
    <AnimatePresence>
      {/* Solo renderiza si isOpen es true */}
      {isOpen && (
        // 1. EL OVERLAY: Oscurece y difumina el fondo
        <motion.div 
          className={styles.overlay}
          onClick={onClose} // Cierra al hacer clic en el fondo
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 2. EL MODAL: El panel que desliza */}
          <motion.div 
            className={styles.modalBody}
            // Evita que el clic en el panel cierre el modal
            onClick={(e) => e.stopPropagation()} 
            initial={{ x: "-100%" }} // Empieza fuera (izquierda)
            animate={{ x: "0%" }}     // Entra a su posición
            exit={{ x: "-100%" }}    // Sale hacia la izquierda
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* 3. El contenido del panel (barra de búsqueda + resultados) */}
            <div className={styles.searchBarWrapper}>
              <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                id="search-input"
                type="text"
                placeholder="Buscar producto o categorias"
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};