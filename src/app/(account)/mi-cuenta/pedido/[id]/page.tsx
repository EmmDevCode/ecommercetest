import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TrackingBar } from '@/components/orders/TrackingBar';
import styles from './pedido.module.css';

type OrderDetails = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    product_name: string;
    product_image: string;
  }[];
};

async function getOrderDetails(orderId: string): Promise<OrderDetails | null> {
  const supabase = await createClient();

  if (!orderId || orderId === 'undefined') return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  console.log('🔍 Buscando pedido:', orderId);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, total_amount, status, shipping_address,
      order_items (
        id, quantity, price_at_purchase, product_id,
        products ( name, images )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  console.log('📊 Resultado COMPLETO de la consulta:');
  console.log('   - Data:', JSON.stringify(data, null, 2));

  if (error || !data) {
    console.error("Error:", error);
    return null;
  }

  // DIAGNÓSTICO CORREGIDO - products es un OBJETO
  console.log('🔍 DIAGNÓSTICO CORREGIDO de order_items:');
  data.order_items.forEach((item: any, index: number) => {
    console.log(`   Item ${index + 1}:`, {
      id: item.id,
      product_id: item.product_id,
      products_type: typeof item.products,
      products_is_array: Array.isArray(item.products),
      products_value: item.products,
      product_name: item.products?.name // ← Acceso directo al objeto
    });
  });

  // TRANSFORMACIÓN CORREGIDA - products es OBJETO, no array
  const transformedItems = data.order_items.map((item: any) => {
    // products es un OBJETO directo, no array
    const product = item.products;
    
    if (product && product.name) {
      console.log(`✅ Item ${item.id} tiene producto: ${product.name}`);
      return {
        id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        product_name: product.name, // ← ¡Ahora sí mostrará "Test"!
        product_image: product.images?.[0]?.url || '/placeholder-image.png'
      };
    } else {
      console.log(`❌ Item ${item.id} NO tiene datos de producto`);
      return {
        id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        product_name: `Producto (ID: ${item.product_id?.substring(0, 8)})`,
        product_image: '/placeholder-image.png'
      };
    }
  });

  console.log('✅ Items transformados:', transformedItems);

  return {
    ...data,
    order_items: transformedItems
  } as OrderDetails;
}

export default async function PedidoDetallePage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) notFound();

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN'
  }).format(order.total_amount);

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link href="/mi-cuenta">Mi Cuenta</Link> / Pedido #{order.id.split('-')[0]}...
      </p>
      <h1>Detalles del Pedido</h1>

      <TrackingBar currentStatus={order.status} />

      <div className={styles.layout}>
        <div className={styles.itemsList}>
          {order.order_items.map(item => (
            <div key={item.id} className={styles.item}>
              <img src={item.product_image} alt={item.product_name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>
                  {item.product_name}
                </span>
                <span className={styles.itemQuantity}>
                  Cantidad: {item.quantity}
                </span>
              </div>
              <span className={styles.itemPrice}>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency', currency: 'MXN'
                }).format(item.price_at_purchase)}
              </span>
            </div>
          ))}
        </div>
        
        <div className={styles.summary}>
          <h3>Resumen</h3>
          <div className={styles.summaryRow}>
            <span>Pedido:</span>
            <span>#{order.id.split('-')[0]}...</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Fecha:</span>
            <span>{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Dirección:</span>
            <span>
              {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.postal_code}
            </span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>{formattedTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}