import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CartView } from '@/components/cart/CartView';
import styles from './carrito.module.css';
import { CheckoutFlow } from '@/components/cart/CheckoutFlow';

// --- (Tipos 'CartItemWithProduct' y 'Address' se quedan igual) ---
export type CartItemWithProduct = {
  id: string;
  quantity: number;
  skus: { 
    id: string;
    price: number | null;
    products: { 
      id: string;
      name: string;
      price: number; 
      images: any;
      slug: string;
    } | null;
    sku_options: { 
      attribute_options: {
        value: string; 
        attributes: {
          name: string; 
        }
      }
    }[]
  } | null;
};

type Address = {
  id: string;
  street: string;
  exterior_num: string;
  colony: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

// --- (getCartItems y getAddresses se quedan igual) ---
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
        skus (
          id,
          price,
          products ( id, name, price, images, slug ),
          sku_options (
            attribute_options (
              value,
              attributes ( name )
            )
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (error || !data?.cart_items) {
    console.error("Error al cargar carrito:", error);
    return [];
  }
  
  const validItems = data.cart_items.filter(
    (item: any) => item.skus && item.skus.products
  );
  
  return validItems as unknown as CartItemWithProduct[];
}

async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('id, street, exterior_num, colony, city, postal_code, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  if (error) {
    console.error("Error al cargar direcciones del carrito:", error);
    return [];
  }
  return data as Address[];
}

// --- El Componente de Página ACTUALIZADO ---
export default async function CarritoPage() {
  const [items, addresses] = await Promise.all([
    getCartItems(),
    getAddresses()
  ]);

  // --- 1. AQUÍ ESTÁ LA CORRECCIÓN ---
  const subtotal = items.reduce((acc, item) => {
    // 1a. Validar la NUEVA estructura
    if (!item.skus || !item.skus.products) {
      console.warn('Item inválido en el carrito:', item);
      return acc;
    }
    
    // 1b. Usar el precio del SKU. Si es nulo, usar el precio base del producto.
    const price = item.skus.price || item.skus.products.price;
    
    // 1c. Calcular
    return acc + (price * item.quantity);
  }, 0);
  // --- FIN DE LA CORRECCIÓN ---

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
            <CheckoutFlow addresses={addresses} />
          </div>
        </div>
      )}
    </div>
  );
}