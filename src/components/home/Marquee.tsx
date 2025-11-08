// src/components/home/Marquee.tsx
"use client";

import { motion } from 'framer-motion';
import styles from './Marquee.module.css';

interface MarqueeProps {
  text: string;
  speed?: number; // Duración en segundos
}

export const Marquee = ({ text, speed = 20 }: MarqueeProps) => {
  return (
    <div className={styles.marqueeContainer}>
      <motion.div
        className={styles.marqueeTrack}
        animate={{
          x: ['0%', '-100%'],
        }}
        transition={{
          ease: 'linear',
          duration: speed,
          repeat: Infinity,
        }}
      >
        {/* Renderizamos el texto 4 veces para un loop perfecto */}
        <span className={styles.marqueeText}>{text}</span>
        <span className={styles.marqueeText}>{text}</span>
        <span className={styles.marqueeText}>{text}</span>
        <span className={styles.marqueeText}>{text}</span>
      </motion.div>
    </div>
  );
};