import Link from 'next/link';
import styles from './ProductCard.module.css';
import { AddToCartButton } from './AddToCartButton';

// Define el tipo de datos para un producto (puedes moverlo a un archivo .d.ts)
// Coincide con tu tabla 'products'
type Product = {
  id: string;
  name: string;
  price: number;
  images: any; // Por ahora 'any', luego lo mejoramos
  slug: string; // Asumiremos que tienes un 'slug' para la URL
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  // Intenta obtener la primera imagen del JSON 'images'
  const imageUrl = product.images?.[0]?.url || '/placeholder-image.png';

  // Formatea el precio a MXN
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);

  return (
    <div className={styles.card}>
      <Link href={`/producto/${product.slug}`} className={styles.linkWrapper}>
        <div className={styles.imageWrapper}>
          <img 
            src={imageUrl} 
            alt={`Imagen de ${product.name}`} 
            className={styles.image}
          />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formattedPrice}</p>
        </div>
      </Link>
      
      {/* 2. Añade el botón aquí abajo */}
      <div className={styles.buttonWrapper}>
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
};