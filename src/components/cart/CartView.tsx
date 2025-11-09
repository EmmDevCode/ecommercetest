"use client";

import { useTransition } from 'react';
import Link from 'next/link';
import { removeItem } from '@/app/carrito/actions';
import type { CartItemWithProduct, Address } from '@/app/carrito/page';
import styles from './CartView.module.css';
import { toast } from 'sonner';
import { QuantitySelector } from './QuantitySelector';
import { CheckoutFlow } from './CheckoutFlow';


// 2. Actualizamos las Props
interface CartViewProps {
  items: CartItemWithProduct[];
  user: any; // O un tipo de User más específico si lo tienes
  addresses: Address[];
}

// Icono de Basura (para el botón de eliminar)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// Función para formatear precio (puedes moverla a /lib/utils)
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export const CartView = ({ items, user, addresses }: CartViewProps) => {
  let [isPending, startTransition] = useTransition();

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const result = await removeItem(itemId);
      if (result.success) {
        toast.success(result.message); // Notificar éxito
      } else {
        toast.error(result.message);
      }
      // ------------------------------------------
    });
  };

  // 3. Traemos la lógica del subtotal que estaba en page.tsx
  const subtotal = items.reduce((acc, item) => {
    if (!item.skus || !item.skus.products) {
      return acc;
    }
    const price = item.skus.price || item.skus.products.price;
    return acc + (price * item.quantity);
  }, 0);



  // Filtrar solo items con productos válidos
  const validItems = items.filter(item => item.skus && item.skus.products);

  return (
    // 5. Usamos el layout de grid (que definiremos en el CSS)
    <div className={styles.layout}>
      
      {/* --- COLUMNA 1: LISTA DE ITEMS --- */}
      <div className={styles.itemsList}>
        {validItems.map((item) => {
          const product = item.skus!.products!;
          const sku = item.skus!;
          const imageUrl = product.images?.[0]?.url || '/placeholder-image.png';
          const productLink = `/producto/${product.slug}`;
          const price = sku.price || product.price;

          return (
            <div key={item.id} className={styles.item}>
              <Link href={productLink} className={styles.imageWrapper}>
                <img src={imageUrl} alt={product.name} className={styles.image} />
              </Link>
              
              <div className={styles.itemInfo}>
                <Link href={productLink}>
                  <h3 className={styles.name}>{product.name}</h3>
                </Link>
                <p className={styles.price}>{formatPrice(price)}</p>
                
                {/* 6. ¡ARREGLO DEL ERROR 2! */}
                <QuantitySelector 
                  cartItemId={item.id} 
                  currentQuantity={item.quantity} 
                />
              </div>
              
              <div className={styles.itemTotal}>
                {formatPrice(price * item.quantity)}
              </div>
              
              <div className={styles.itemActions}>
                <button 
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                  className={styles.removeButton}
                  title="Eliminar"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- COLUMNA 2: RESUMEN (El JSX de page.tsx) --- */}
      <div className={styles.summary}>
        <h2>Resumen</h2>
        <div className={styles.summaryRow}>
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Envío:</span>
          <span>A calcular</span>
        </div>
        
        <div className={styles.divider}></div>

        <div className={styles.summaryTotal}>
          <span>Total:</span>
          <span>{formatPrice(subtotal)}</span> {/* (Añade envío si lo calculas) */}
        </div>
        
        {/* 7. ¡ARREGLO DEL ERROR 3! */}
        <CheckoutFlow 
          addresses={addresses} 
        />
      </div>

    </div>
  );
};