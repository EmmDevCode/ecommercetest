// src/components/account/AddressCard.tsx
"use client";

import { useTransition } from "react";
import { deleteAddress } from "@/app/(account)/mi-cuenta/actions";
import styles from "./AddressCard.module.css";
import { toast } from "sonner";

// 1. Define el tipo de dato para una dirección
//    (Asegúrate que coincida con tu tabla)
type Address = {
  id: string;
  street: string;
  exterior_num: string;
  interior_num: string | null;
  colony: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

export function AddressCard({ address }: { address: Address }) {
  const [isPending, startTransition] = useTransition();

  // 2. Función para manejar el borrado
  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta dirección?")) {
      startTransition(async () => {
        const result = await deleteAddress(address.id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  return (
    <div className={styles.card}>
      {address.is_default && (
        <span className={styles.defaultBadge}>Predeterminada</span>
      )}
      <p className={styles.addressLine}>
        {address.street} {address.exterior_num}
        {address.interior_num && `, ${address.interior_num}`}
      </p>
      <p className={styles.addressLine}>{address.colony}</p>
      <p className={styles.addressLine}>
        {address.city}, {address.state}, C.P. {address.postal_code}
      </p>
      
      <div className={styles.actions}>
        {/* TODO: Implementar "Editar" y "Marcar como Predeterminada" */}
        <button className={styles.button} disabled={isPending}>
          Editar
        </button>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className={`${styles.button} ${styles.deleteButton}`}
        >
          {isPending ? "Borrando..." : "Borrar"}
        </button>
      </div>
    </div>
  );
}