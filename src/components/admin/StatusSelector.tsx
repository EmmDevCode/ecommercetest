"use client";

import { useTransition } from 'react';
import { updateOrderStatus } from '@/app/(admin)/admin/orders/actions';
import styles from './StatusSelector.module.css';
import { toast } from 'sonner';

// Opciones que coinciden con tu ENUM de la base de datos
const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'out_for_delivery', label: 'En Reparto' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
];

interface StatusSelectorProps {
  orderId: string;
  currentStatus: string;
}

export const StatusSelector = ({ orderId, currentStatus }: StatusSelectorProps) => {
  let [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    // Inicia la Server Action en una transición
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      // --- 2. Reemplazar alert (y añadir éxito) ---
      if (result.success) {
        toast.success(result.message); // Notificar éxito
      } else {
        toast.error(result.message); // Muestra error si algo falla
      }
      // ------------------------------------------
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={isPending} // Se deshabilita mientras guarda
      className={styles.selector}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};