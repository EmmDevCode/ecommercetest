import { createClient } from '@/lib/supabase/server';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import styles from './admin.module.css';

// --- Tipos ---
type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
};

// --- Componente StatCard (Reutilizable) ---
const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <div className={styles.statCard}>
    <div className={styles.statHeader}>
      <span className={styles.statTitle}>{title}</span>
      <div className={styles.iconWrapper}>
        <Icon size={20} />
      </div>
    </div>
    <div className={styles.statValue}>{value}</div>
    {/* Nota: Para calcular tendencias reales (trends) necesitarías comparar con el mes anterior.
        Por ahora mostramos una descripción simple. */}
    <div className={styles.statTrend}>
      <span className={styles.trendNeutral}>{description}</span>
    </div>
  </div>
);

// --- Función de Carga de Datos ---
async function getDashboardData() {
  const supabase = await createClient();

  // Ejecutamos todas las consultas en paralelo para mayor velocidad
  const [ordersResponse, productsResponse, profilesResponse, recentOrdersResponse] = await Promise.all([
    // 1. Total Pedidos y Ventas (Solo pagados)
    supabase
      .from('orders')
      .select('total, payment_status')
      .eq('payment_status', 'paid'), // Asumiendo que solo cuentas los pagados
    
    // 2. Total Productos Activos
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),

    // 3. Total Clientes (Perfiles)
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),

    // 4. Pedidos Recientes (Últimos 5)
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  // Procesamos los datos
  const orders = ordersResponse.data || [];
  
  // Calcular Ingresos Totales (Suma del total de ordenes pagadas)
  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  
  // Totales
  const stats: DashboardStats = {
    totalRevenue,
    totalOrders: orders.length, // O usa count: 'exact' si tienes muchos miles
    totalCustomers: profilesResponse.count || 0,
    totalProducts: productsResponse.count || 0,
  };

  return {
    stats,
    recentOrders: recentOrdersResponse.data || []
  };
}

// --- Formateador de Moneda ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export default async function AdminDashboard() {
  // Obtenemos los datos reales
  const { stats, recentOrders } = await getDashboardData();
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <span className={styles.date}>
          Datos actualizados al: {new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </span>
      </div>

      {/* Grid de Métricas Reales */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Ingresos Totales" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          description="Total histórico ventas pagadas"
        />
        <StatCard 
          title="Pedidos Pagados" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          description="Total de ordenes procesadas"
        />
        <StatCard 
          title="Clientes Registrados" 
          value={stats.totalCustomers} 
          icon={Users} 
          description="Usuarios con cuenta"
        />
        <StatCard 
          title="Productos Activos" 
          value={stats.totalProducts} 
          icon={Package} 
          description="Disponibles en catálogo"
        />
      </div>

      {/* Sección de Actividad Reciente Real */}
      <div className={styles.section}>
        <div className={styles.pageHeader} style={{ marginBottom: '1rem' }}>
          <h2 className={styles.sectionTitle}>Pedidos Recientes</h2>
          <Link href="/admin/orders" className={styles.actionButton}>
            Ver todos
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace' }}>
                        #{order.id.slice(0, 8)}
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString('es-MX')}
                      </td>
                      <td>
                        {order.customer_email || 'Invitado'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${
                          order.payment_status === 'paid' ? styles.badgeSuccess : styles.badgeWarning
                        }`}>
                          {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
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
                      No hay pedidos recientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}