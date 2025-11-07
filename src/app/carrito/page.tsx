import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CartView } from '@/components/cart/CartView';
import styles from './carrito.module.css';
import { CheckoutButton } from '@/components/cart/CheckoutButton';

// --- Definición de Tipos CORREGIDA ---
export type CartItemWithProduct = {
  id: string;
  quantity: number;
  products: { // ES UN OBJETO, no array
    id: string;
    name: string;
    price: number;
    images: any;
  } | null;
};

// --- Función de Carga de Datos CORREGIDA ---
// --- Función ALTERNATIVA con tipo más estricto ---
async function getCartItems(): Promise<CartItemWithProduct[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('carts')
    .select(`
      cart_items (
        id, 
        quantity,
        products (
          id, 
          name, 
          price, 
          images
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (error || !data?.cart_items) return [];

  // Transformación explícita de los datos
  const validItems: CartItemWithProduct[] = data.cart_items
    .map((item: any) => {
      // Si products es un array, tomamos el primer elemento
      // Si es un objeto, lo usamos directamente
      let products = item.products;
      
      if (Array.isArray(products) && products.length > 0) {
        products = products[0];
      } else if (Array.isArray(products) && products.length === 0) {
        products = null;
      }
      
      return {
        id: item.id,
        quantity: item.quantity,
        products: products
      };
    })
    .filter((item: any) => item.products !== null && item.products.id);

  return validItems;
}

// --- El Componente de Página ACTUALIZADO ---
export default async function CarritoPage() {
  const items = await getCartItems();

  console.log('🛒 Items para procesar:', items);

  // CÁLCULO DEL SUBTOTAL CORREGIDO
  const subtotal = items.reduce((acc, item) => {
    // Verificación más robusta
    if (!item.products || 
        typeof item.products !== 'object' ||
        Array.isArray(item.products) || // ← Verificar que NO sea array
        typeof item.products.price !== 'number') {
      console.warn('Producto inválido en item:', item);
      return acc;
    }
    
    return acc + (item.products.price * item.quantity);
  }, 0);

  console.log('💰 Subtotal calculado:', subtotal);

  const formattedSubtotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(subtotal);

  return (
    <div className={styles.page}>
      <h1>Tu Carrito</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Tu carrito está vacío.</p>
          <Link href="/productos">Ver productos</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          
          <div className={styles.itemsList}>
            <CartView items={items} />
          </div>

          <div className={styles.summary}>
            <h2>Resumen</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío:</span>
              <span>A calcular</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total:</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className={styles.checkoutButtonWrapper}>
              <CheckoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}