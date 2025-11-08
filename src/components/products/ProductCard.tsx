// src/components/products/ProductCard.tsx
import Link from 'next/link';
import styles from './ProductCard.module.css';

// 1. Define el tipo de datos (¡ACTUALIZADO!)
// Ahora esperamos la información de la categoría
type Product = {
  id: string;
  name: string;
  price: number;
  images: any;
  slug: string;
  // ¡NUEVO! Añadimos la categoría
  product_categories: {
    categories: {
      name: string;
    }
  }[] | null; // Puede ser un array o nulo
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.images?.[0]?.url || '/placeholder-image.png';

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);

  // 2. ¡NUEVO! Obtenemos el nombre de la categoría
  const category = product.product_categories?.[0]?.categories?.name || "Sin categoría";

  return (
    // El 'div' exterior ya no es necesario si no hay botón
    <Link href={`/producto/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img 
          src={imageUrl} 
          alt={`Imagen de ${product.name}`} 
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        {/* 3. ¡NUEVO! Mostramos la categoría */}
        <span className={styles.category}>{category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formattedPrice}</p>
      </div>
    </Link>
  );
};