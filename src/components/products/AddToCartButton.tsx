// src/components/products/AddToCartButton.tsx
"use client";

import { useTransition } from 'react';
import { addToCart } from '@/app/carrito/actions';
import { Button } from '@/components/ui/Button'; 
import { toast } from 'sonner';

interface AddToCartButtonProps {
  skuId: string | null; // <-- 1. Cambiado de productId a skuId
  disabled?: boolean;
}

export const AddToCartButton = ({ skuId, disabled = false }: AddToCartButtonProps) => {
  let [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // 2. Validar que un SKU fue seleccionado
    if (!skuId) {
      toast.error("Variante de producto no encontrada.");
      return;
    }

    startTransition(async () => {
      // 3. Pasar el skuId a la acción
      const result = await addToCart(skuId);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={isPending || disabled} // 4. Deshabilitado si no hay SKU
    >
      {isPending ? "Añadiendo..." : (
        disabled ? "No disponible" : "Añadir al Carrito"
      )}
    </Button>
  );
};