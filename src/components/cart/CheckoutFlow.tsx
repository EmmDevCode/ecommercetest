// src/components/cart/CheckoutFlow.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckoutButton } from "./CheckoutButton";
import styles from "./CheckoutFlow.module.css";

// Definimos el tipo de una dirección (¡ajusta esto a tu tabla!)
type Address = {
  id: string;
  street: string;
  exterior_num: string;
  colony: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

interface CheckoutFlowProps {
  addresses: Address[]; // Las direcciones se cargan desde el servidor
}

export const CheckoutFlow = ({ addresses }: CheckoutFlowProps) => {
  
  // 1. Estado para guardar el ID de la dirección seleccionada
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => {
      // Intenta encontrar la 'default' o usa la primera
      const defaultAddress = addresses.find(a => a.is_default);
      return defaultAddress?.id || addresses[0]?.id || null;
    }
  );

  return (
    <div className={styles.flow}>
      <h3 className={styles.title}>Dirección de Envío</h3>
      
      {addresses.length === 0 ? (
        // 2. Si no hay direcciones, pide al usuario que cree una
        <div className={styles.noAddress}>
          <p>No tienes direcciones guardadas.</p>
          <Link href="/mi-cuenta/direcciones" className={styles.link}>
            Añadir Dirección
          </Link>
        </div>
      ) : (
        // 3. Si hay direcciones, muestra el <select>
        <select
          value={selectedAddressId || ""}
          onChange={(e) => setSelectedAddressId(e.target.value)}
          className={styles.select}
        >
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.street} {address.exterior_num}, {address.colony}, {address.city}
            </option>
          ))}
        </select>
      )}

      {/* 4. Renderiza el botón de pago y le pasa el ID del estado */}
      <div className={styles.checkoutButtonWrapper}>
        <CheckoutButton 
          addressId={selectedAddressId} 
        /> 
      </div>
    </div>
  );
};