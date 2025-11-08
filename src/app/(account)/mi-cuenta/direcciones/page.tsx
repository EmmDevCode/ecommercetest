// src/app/mi-cuenta/direcciones/page.tsx
import { createClient } from '@/lib/supabase/server';
import { AddressForm } from '@/components/account/AddressForm';
import { AddressCard } from '@/components/account/AddressCard';
import styles from './direcciones.module.css';

// 1. Carga las direcciones del usuario en el Servidor
async function getAddresses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Tu RLS protege esta consulta
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
    // Cambiamos 'created_at' por 'is_default'
    .order('is_default', { ascending: false }); // Predeterminada primero

  if (error) {
    // Esto ahora ya no debería fallar
    console.error("Error al cargar direcciones:", error); 
    return [];
  }
  return data;
}

export default async function DireccionesPage() {
  const addresses = await getAddresses();

  return (
    <div className={styles.page}>
      <h1>Mis Direcciones</h1>
      <p>Añade y gestiona tus direcciones de envío.</p>

      <div className={styles.layout}>
        {/* Columna 1: Formulario para añadir */}
        <div className={styles.formColumn}>
          <h2>Añadir Nueva Dirección</h2>
          <AddressForm />
        </div>

        {/* Columna 2: Lista de direcciones */}
        <div className={styles.listColumn}>
          <h2>Direcciones Guardadas</h2>
          {addresses.length === 0 ? (
            <p>No tienes direcciones guardadas.</p>
          ) : (
            <div className={styles.list}>
              {addresses.map((address) => (
                <AddressCard key={address.id} address={address} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}