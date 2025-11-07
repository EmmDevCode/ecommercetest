import { createClient } from '@/lib/supabase/server';
// ⚠️ ELIMINA esta línea - ya no necesitas cookies
// import { cookies } from 'next/headers';
import { ProductCard } from '@/components/products/ProductCard';
import styles from './productos.module.css';

// Función para obtener los productos del servidor
async function getProducts() {
  // ⚠️ ELIMINA esta línea
  // const cookieStore = cookies();
  
  // ⚠️ ACTUALIZA: usa await con createClient()
  const supabase = await createClient();

  // Usamos la RLS que creamos:
  // "Anyone can view active products."
  const { data, error } = await supabase
    .from('products')
    .select('*') // Selecciona todo
    .eq('active', true); // Solo productos activos

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return data;
}

// --- La Página (Server Component) ---
export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nuestro Catálogo</h1>

      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}