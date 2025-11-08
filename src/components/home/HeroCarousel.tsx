// src/components/home/HeroCarousel.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroCarousel.module.css';
import Link from 'next/link';

// Datos de ejemplo (puedes cambiarlos por tus productos)
const slides = [
  { id: 1, color: '#0d1a2e', title: 'Producto Destacado 1' },
  { id: 2, color: '#1a4f6e', title: 'Producto Destacado 2' },
  { id: 3, color: '#0070f3', title: 'Producto Destacado 3' },
  { id: 4, color: '#ff0080', title: 'Producto Destacado 4' },
];

// Animaciones para el slide central
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300, // Entra desde la derecha o izquierda
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300, // Sale hacia la derecha o izquierda
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  })
};

export const HeroCarousel = () => {
  const [page, setPage] = useState(0); // Índice del slide
  const [direction, setDirection] = useState(0); // 1 para sig, -1 para prev
  const [isHovered, setIsHovered] = useState(false);

  // --- 1. Lógica de Auto-play ---
  useEffect(() => {
    // No hacer nada si el usuario está interactuando
    if (isHovered) return;

    // Cambia de slide cada 4 segundos
    const timer = setInterval(() => {
      paginate(1);
    }, 4000);

    return () => clearInterval(timer); // Limpia el timer al desmontar
  }, [isHovered, page]); // Se resetea cada vez que cambia el slide o el hover

  
  // --- 2. Lógica de Paginación ---
  
  // Función para obtener un índice válido (loop)
  const getIndex = (index: number) => {
    return (index + slides.length) % slides.length;
  };

  // Índices de los slides visibles
  const activeIndex = getIndex(page);
  const prevIndex = getIndex(page - 1);
  const nextIndex = getIndex(page + 1);

  // Función para cambiar de página
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setPage(page + newDirection);
  };
  
  // Función para ir a un dot específico
  const goToPage = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setPage(newIndex);
  };

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={() => setIsHovered(true)} // Pausa en hover
      onMouseLeave={() => setIsHovered(false)} // Reanuda al salir
    >
      
      {/* --- 3. Ghost Slide (Previo) --- */}
      <motion.div 
        key={prevIndex} // Key para que se actualice
        className={`${styles.slide} ${styles.ghost} ${styles.prev}`}
        style={{ backgroundColor: slides[prevIndex].color }}
        onClick={() => paginate(-1)}
        animate={{ scale: 0.8, x: '-70%', opacity: 0.4 }}
        transition={{ duration: 0.3 }}
      />


      {/* --- 4. Slide Activo (Central) --- */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page} // La key 'page' es crucial para que AnimatePresence funcione
          className={styles.slide}
          style={{ backgroundColor: slides[activeIndex].color }}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          custom={direction} // Pasa la dirección a las variantes
          
          // Gesto de Swipe
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x < -50) paginate(1); // Swipe izq
            else if (offset.x > 50) paginate(-1); // Swipe der
          }}
        >
          <h2>{slides[activeIndex].title}</h2>
        </motion.div>
      </AnimatePresence>

      {/* --- 5. Ghost Slide (Siguiente) --- */}
      <motion.div 
        key={nextIndex} // Key para que se actualice
        className={`${styles.slide} ${styles.ghost} ${styles.next}`}
        style={{ backgroundColor: slides[nextIndex].color }}
        onClick={() => paginate(1)}
        animate={{ scale: 0.8, x: '70%', opacity: 0.4 }}
        transition={{ duration: 0.3 }}
      />

      <div className={styles.slideActions}>
        <Link 
          // 4. El enlace es dinámico al slide activo
          href={`/productos/${slides[activeIndex].id}`}
          className={`${styles.actionButton} ${styles.primary}`}
        >
          ver producto
          <span className={styles.icon}>&times;</span>
        </Link>
        <Link 
          href="/productos" // Enlace a tu catálogo
          className={`${styles.actionButton} ${styles.secondary}`}
        >
          buscar producto
          <span className={styles.icon}>→</span>
        </Link>
      </div>
      
      {/* --- 6. Puntos de Navegación (con Píldora) --- */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={styles.dotContainer}
            onClick={() => goToPage(index)}
          >
            {index === activeIndex ? (
              // Esta es la Píldora activa
              <motion.div className={styles.activePill} layoutId="active-pill" />
            ) : (
              // Este es el punto inactivo
              <div className={styles.inactiveDot} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};