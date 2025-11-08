"use client";

import { useTransition } from 'react';
import { createOrderAndPay } from '@/app/checkout/actions';
import styles from './CheckoutButton.module.css';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  addressId: string | null; // El ID de la dirección seleccionada
}

export const CheckoutButton = ({ addressId }: CheckoutButtonProps) => {
  let [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    // 2. Valida el addressId aquí
    if (!addressId) {
      toast.error("Por favor, selecciona una dirección de envío.");
      return;
    }

    startTransition(async () => {
      // 3. Pasa el addressId a la Server Action
      const result = await createOrderAndPay(addressId);
      
      if (result.success && result.url) {
        // ¡Éxito! Redirigimos
        window.location.href = result.url;
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isPending}
      className={styles.checkoutButton} // Usaremos la clase del .module.css
    >
      {isPending ? "Procesando..." : "Proceder al Pago (Conekta)"}
    </button>
  );
};