import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './orders.module.css';
import { StatusSelector } from '@/components/admin/StatusSelector';

// --- DEFINICIÓN DE TIPOS ---
type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

type OrderWithCustomer = Order & {
  customer_name: string;
};

type OrdersResponse = {
  orders: OrderWithCustomer[];
  error: string | null;
};

// Esta función obtiene los pedidos del servidor
async function getOrders(): Promise<OrdersResponse> {
  const supabase = await createClient();

  // 1. Verificamos que el usuario sea 'admin'
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { orders: [], error: 'No autenticado.' };
  }

  // Verificar rol de admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { 
      orders: [], 
      error: 'Acción no autorizada. Debes ser administrador.' 
    };
  }

  // 2. Obtenemos los pedidos
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false }); 

  if (ordersError) {
    console.error("Error al obtener pedidos:", ordersError);
    return { orders: [], error: ordersError.message };
  }

  if (!ordersData || ordersData.length === 0) {
    return { orders: [], error: null };
  }

  // 3. Obtenemos los perfiles de los usuarios
  const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
  
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  // Crear un mapa para búsqueda rápida
  const profilesMap = new Map();
  profilesData?.forEach(profile => {
    profilesMap.set(profile.id, profile.full_name);
  });

  // 4. Combinamos los datos
  const orders: OrderWithCustomer[] = ordersData.map(order => ({
    ...order,
    customer_name: profilesMap.get(order.user_id) || `Usuario ${order.user_id.substring(0, 8)}...`
  }));

  return { orders, error: null };
}

// --- La Página ---
export default async function AdminOrdersPage() {
  const { orders, error } = await getOrders();

  if (error) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/admin">Volver al Panel</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Gestión de Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay pedidos registrados.</p>
          <Link href="/admin">Volver al Panel</Link>
        </div>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>ID del Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderId}>{order.id.split('-')[0]}...</td>
                <td>{order.customer_name}</td>
                <td>{new Date(order.created_at).toLocaleDateString('es-MX')}</td>
                <td>
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(order.total_amount)}
                </td>
                <td>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td>
  <StatusSelector
    orderId={order.id}
    currentStatus={order.status}
  />
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}