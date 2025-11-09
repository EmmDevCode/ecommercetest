// src/components/layout/NavDropdown.tsx
"use client";

import { useState } from 'react' // 1. Quitamos useRef y useEffect
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './NavDropdown.module.css';
import headerStyles from './Header.module.css';

type Category = {
  name: string;
  slug: string;
};

interface NavDropdownProps {
  title: string;
  categories: Category[];
}

export const NavDropdown = ({ title, categories }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2, ease: 'easeOut' } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    // 2. Volvemos a poner los eventos de "hover" aquí
    <div 
      className={styles.dropdownContainer}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 3. Quitamos el 'onClick' del botón */}
      <button 
        className={`${headerStyles.navLink} ${styles.dropdownButton}`}
      >
        {title}
        <motion.span
          className={styles.caret}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdownMenu}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className={styles.grid}>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link 
                    key={cat.slug} 
                    href={`/categoria/${cat.slug}`} 
                    className={styles.categoryLink}
                    onClick={() => setIsOpen(false)} // 4. Dejamos el onClick aquí (es bueno para móviles)
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <span className={styles.noCategories}>No hay categorías</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};