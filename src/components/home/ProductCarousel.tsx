// src/components/home/ProductCarousel.tsx
"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import styles from './ProductCarousel.module.css';

// 1. Define el tipo de producto (debe coincidir con el de ProductCard)
type Product = {
  id: string;
  name: string;
  price: number;
  images: any; 
  slug: string; 
  product_categories: {
    categories: {
      name: string;
    }
  }[] | null;
};

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  // 2. Ref para el contenedor que define los límites del drag
  const constraintsRef = useRef(null);

  return (
    // 3. Contenedor exterior que define el área visible
    <div className={styles.carouselContainer} ref={constraintsRef}>
      {/* 4. Pista interna que se puede arrastrar */}
      <motion.div
        className={styles.carouselTrack}
        drag="x" // Habilita el drag horizontal
        // 5. Limita el drag para que no se salga
        dragConstraints={constraintsRef}
      >
        {products.map((product) => (
          // 6. Contenedor de cada item
          <motion.div key={product.id} className={styles.item}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};