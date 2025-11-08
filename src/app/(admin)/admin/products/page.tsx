import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './products.module.css';

// Esta función obtiene los productos del servidor
async function getProducts() {
  
  const supabase = await createClient();

  // Verificación de Admin (similar a la de pedidos)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return { products: [], error: 'Acción no autorizada.' };
    }
  } else {
    return { products: [], error: 'No autenticado.' };
  }

  // Obtenemos los productos
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images') 
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al obtener productos:", error);
    return { products: [], error: error.message };
  }
  
  return { products: data, error: null };
}


// --- La Página ---
export default async function AdminProductsPage() {
  const { products, error } = await getProducts();

  if (error) {
    return (
      <div className={styles.page}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Gestión de Productos</h1>
        <Link href="/admin/products/new" className={styles.button}>
          Crear Nuevo Producto
        </Link>
      </div>

      <table className={styles.productsTable}>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img 
                  src={product.images?.[0]?.url || '/placeholder-image.png'} 
                  alt={product.name} 
                  className={styles.productImage}
                />
              </td>
              <td>{product.name}</td>
              <td>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(product.price)}
              </td>
              <td>
                <Link 
                  href={`/admin/products/${product.id}/edit`} 
                  className={styles.button}
                >
                  Editar
                </Link>
                {/* TODO: Botón de Borrar (siguiente paso si quieres) */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}