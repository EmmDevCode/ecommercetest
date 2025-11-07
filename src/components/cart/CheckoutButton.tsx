"use client";

import { useTransition } from 'react';
import { createOrderAndPay } from '@/app/checkout/actions';
import styles from './CheckoutButton.module.css';

export const CheckoutButton = () => {
  let [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      const result = await createOrderAndPay();
      
      if (result.success && result.url) {
        // ¡Éxito! Redirigimos al usuario a la URL de pago de Conekta
        window.location.href = result.url;
      } else {
        // Mostramos el error
        alert(result.message);
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