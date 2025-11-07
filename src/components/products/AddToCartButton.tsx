"use client";

import { useTransition } from 'react';
import { addToCart } from '@/app/carrito/actions';
import { Button } from '@/components/ui/Button'; // Reutilizamos nuestro botón

interface AddToCartButtonProps {
  productId: string;
}

export const AddToCartButton = ({ productId }: AddToCartButtonProps) => {
  // useTransition nos permite mostrar un estado "cargando"
  // sin bloquear la UI
  let [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // startTransition ejecuta la Server Action
    startTransition(async () => {
      const result = await addToCart(productId);
      
      if (result.success) {
        // Éxito: podrías mostrar un "toast" o notificación
        alert(result.message); 
      } else {
        // Error: muestra el mensaje de error (ej. "Debes iniciar sesión")
        alert(result.message);
      }
    });
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Añadiendo..." : "Añadir al Carrito"}
    </Button>
  );
};