// src/components/home/AccordionItem.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AccordionItem.module.css";

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode; // ← CAMBIA de string a React.ReactNode
  children: React.ReactNode;
}

export const AccordionItem = ({ title, icon, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Animaciones para el contenido
  const contentVariants = {
    collapsed: { opacity: 0, height: 0, marginTop: 0 },
    open: { 
      opacity: 1, 
      height: "auto", 
      marginTop: "1rem" 
    },
  };

  return (
    <div className={styles.accordionItem}>
      {/* Botón con estilo Neumorfista */}
      <button 
        className={styles.accordionButton} 
        onClick={() => setIsOpen(!isOpen)}
        data-active={isOpen} 
      >
        <span className={styles.title}>
          <span className={styles.icon}>{icon}</span> {/* ← Ahora acepta JSX */}
          {title}
        </span>
        <span className={styles.plus}>{isOpen ? "−" : "+"}</span>
      </button>

      {/* Contenido colapsable */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.accordionContent}
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={contentVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};