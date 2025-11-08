"use client";

import { useTransition } from 'react';
import { updateQuantity } from '@/app/carrito/actions';
import styles from './QuantitySelector.module.css';
import { toast } from 'sonner';

interface QuantitySelectorProps {
  cartItemId: string;
  currentQuantity: number;
}

export const QuantitySelector = ({ 
  cartItemId, 
  currentQuantity 
}: QuantitySelectorProps) => {
  let [isPending, startTransition] = useTransition();

  const handleUpdate = (newQuantity: number) => {
    // No actualiza si la cantidad es 0 o menos
    if (newQuantity < 1) return;

    startTransition(async () => {
      const result = await updateQuantity(cartItemId, newQuantity);
     if (!result.success) {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className={styles.selector}>
      <button 
        onClick={() => handleUpdate(currentQuantity - 1)}
        disabled={isPending || currentQuantity <= 1}
        className={styles.button}
      >
        -
      </button>
      <span className={styles.quantity}>
        {isPending ? '...' : currentQuantity}
      </span>
      <button 
        onClick={() => handleUpdate(currentQuantity + 1)}
        disabled={isPending}
        className={styles.button}
      >
        +
      </button>
    </div>
  );
};