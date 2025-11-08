"use client";

import { useTransition } from 'react';
import Link from 'next/link';
import { removeItem } from '@/app/carrito/actions';
import type { CartItemWithProduct } from '@/app/carrito/page';
import styles from './CartView.module.css';
import { toast } from 'sonner';
import { QuantitySelector } from './QuantitySelector';

interface CartViewProps {
  items: CartItemWithProduct[];
}

export const CartView = ({ items }: CartViewProps) => {
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

  // Filtrar solo items con productos válidos
  const validItems = items.filter(item => item.skus && item.skus.products);

  return (
    <div className={styles.cartList}>
      {validItems.map((item) => {
        // products es un objeto, no array - y sabemos que no es null por el filtro
        const product = item.skus!.products!;
        const sku = item.skus!;
        
        const imageUrl = product.images?.[0]?.url || '/placeholder-image.png';
        const productLink = `/producto/${product.slug}`;

        // 3. Formatear las opciones (Talla: M, Color: Rojo)
        const optionsText = sku.sku_options.map(opt => {
          const name = opt.attribute_options.attributes.name;
          const value = opt.attribute_options.value;
          return `${name}: ${value}`;
        }).join(', ');

        // 4. Usar el precio del SKU o el precio base
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
              <p className={styles.price}>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(product.price)}
              </p>
              <p className={styles.quantity}>Cantidad: {item.quantity}</p>
            </div>
            
            <div className={styles.itemActions}>
              <button 
                onClick={() => handleRemove(item.id)}
                disabled={isPending}
                className={styles.removeButton}
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};