import { createClient } from '@/lib/supabase/server';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { StatusSelector } from '@/components/admin/StatusSelector';
import styles from './orders.module.css';

// --- 1. TIPOS ---
type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
};

type OrderWithCustomer = Order & {
  customer_name: string;
};

type OrdersResponse = {
  orders: OrderWithCustomer[];
  error: string | null;
};

// --- 2. LÓGICA DE DATOS ---
async function getOrders(): Promise<OrdersResponse> {
  const supabase = await createClient();

  // Verificamos autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { orders: [], error: 'No autenticado.' };

  // Verificamos rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { orders: [], error: 'Acción no autorizada.' };
  }

  // Obtenemos pedidos
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

  // Obtenemos nombres de clientes
  const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
  
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profilesMap = new Map();
  profilesData?.forEach(profile => {
    profilesMap.set(profile.id, profile.full_name);
  });

  const orders: OrderWithCustomer[] = ordersData.map(order => ({
    ...order,
    customer_name: profilesMap.get(order.user_id) || `Usuario...`
  }));

  return { orders, error: null };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

// --- 3. PÁGINA ---
export default async function AdminOrdersPage() {
  const { orders, error } = await getOrders();

  if (error) {
    return (
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gestión de Pedidos</h1>
          <p className={styles.pageSubtitle}>Historial completo de ventas.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              {/* CORRECCIÓN: Eliminamos espacios/comentarios entre los <th> */}
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado Actual</th>
                <th style={{ textAlign: 'right' }}>Ver</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      #{order.id.slice(0, 8)}...
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {order.customer_name}
                    </td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(order.total_amount)}
                    </td>
                    
                    {/* ✅ AQUÍ ESTÁ EL SELECTOR FUNCIONAL */}
                    <td>
                      <StatusSelector
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>
                    
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/orders/${order.id}`} className={styles.actionIcon}>
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                    No hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}