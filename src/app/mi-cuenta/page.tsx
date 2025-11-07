import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
// Importaremos los estilos del admin para reutilizar las burbujas de estado
import adminStyles from '../admin/orders/orders.module.css';
// Importaremos los estilos de esta página
import styles from './mi-cuenta.module.css';

// Tipado para los pedidos
type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
};

// Función de servidor para obtener los pedidos del usuario
async function getMyOrders(): Promise<Order[]> {
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return []; // Si no hay usuario, retorna un array vacío

  // Obtenemos solo los pedidos del usuario logueado
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, total_amount, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Los más nuevos primero

  if (error) {
    console.error("Error al obtener mis pedidos:", error);
    return [];
  }

  return data;
}


// --- La Página ---
export default async function MiCuentaPage() {
  const orders = await getMyOrders();

  return (
    <div className={styles.page}>
      <h1>Mi Cuenta</h1>
      
      {/* TODO: Aquí irían otros componentes como "Mis Direcciones" */}
      
      <h2 className={styles.subHeader}>Mi Historial de Pedidos</h2>

      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>Aún no has realizado ningún pedido.</p>
          <Link href="/productos" className={styles.button}>
            Ver productos
          </Link>
        </div>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Pedido #</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderId}>{order.id.split('-')[0]}...</td>
                <td>{new Date(order.created_at).toLocaleDateString('es-MX')}</td>
                <td>
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(order.total_amount)}
                </td>
                <td>
                  {/* Reutilizamos los estilos del admin */}
                  <span className={`${adminStyles.status} ${adminStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <Link href={`/mi-cuenta/pedido/${order.id}`} className={styles.button}>
                    Ver Detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}