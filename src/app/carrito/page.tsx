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

export type Address = {
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
export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const items = await getCartItems();
  const addresses = await getAddresses();

  // --- ¡YA NO CALCULAMOS EL SUBTOTAL AQUÍ! ---
  // Lo haremos en el componente cliente (CartView)

  return (
    // 1. Usamos la clase .page que acabamos de hacer blanca
    <div className={styles.page}>
        <h1>Tu Carrito</h1>

        {items.length === 0 ? (
          <div className={styles.empty}> {/* (Puedes mover esta clase a CartView.module.css) */}
            <p>Tu carrito está vacío.</p>
            <Link href="/productos">Ver productos</Link>
          </div>
        ) : (
          // 3. Renderizamos CartView
          // Ahora le pasamos 'user', 'items' y 'addresses'
          <CartView items={items} user={user} addresses={addresses} />
        )}
      </div>
  );
}