// src/components/home/Typewriter.tsx
"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import styles from './Typewriter.module.css';

interface TypewriterProps {
  text: string;
}

export const Typewriter = ({ text }: TypewriterProps) => {
  const ref = useRef(null);
  // Anima solo cuando el componente es visible
  const isInView = useInView(ref, { once: true, amount: 0.5 }); 

  const letters = Array.from(text);

  // Variante para el contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04, // Tiempo entre cada letra
      },
    },
  };

  // Variante para cada letra
  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.h2
      ref={ref}
      className={styles.wrapper}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      aria-label={text}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className={styles.letter}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
      {/* Opcional: Añadir un cursor parpadeante */}
      <motion.span 
        className={styles.caret}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </motion.h2>
  );
};