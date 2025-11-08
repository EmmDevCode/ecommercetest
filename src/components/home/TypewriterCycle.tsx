// src/components/home/TypewriterCycle.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TypewriterCycle.module.css';

interface TypewriterCycleProps {
  baseText: string;
  words: string[];
}

export const TypewriterCycle = ({ baseText, words }: TypewriterCycleProps) => {
  const [index, setIndex] = useState(0);

  // Hook para cambiar la palabra cada 3 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000); 
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <h2 className={styles.wrapper}>
      {baseText}
      {/* AnimatePresence maneja la salida de la palabra vieja */}
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]} // La key es la palabra
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={styles.word}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </h2>
  );
};