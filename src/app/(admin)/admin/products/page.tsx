import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import styles from './products.module.css';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, product_categories(categories(name))')
    .order('created_at', { ascending: false });

  return (
    <div>
      {/* Header con Acción Principal */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Productos</h1>
          <p className={styles.pageSubtitle}>Gestiona tu catálogo, inventario y precios.</p>
        </div>
        <Link href="/admin/products/new" className={styles.primaryButton}>
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      {/* Barra de Herramientas (Búsqueda/Filtros) */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Buscar productos..." className={styles.searchInput} />
        </div>
        {/* Aquí podrías poner filtros */}
      </div>

      {/* Tabla Card */}
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => {
                const category = product.product_categories?.[0]?.categories?.name || 'Sin Categoría';
                const statusClass = product.active ? styles.badgeSuccess : styles.badgeNeutral;
                
                return (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        {/* Imagen miniatura */}
                        <div className={styles.thumbnail}>
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt="" />
                          ) : (
                            <div className={styles.placeholderImg} />
                          )}
                        </div>
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </td>
                    <td>{category}</td>
                    <td className={styles.fontMedium}>${product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`${styles.badge} ${statusClass}`}>
                        {product.active ? 'Activo' : 'Borrador'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actions}>
                        <Link href={`/admin/products/${product.id}/edit`} className={styles.actionIcon}>
                          <Edit size={16} />
                        </Link>
                        <button className={`${styles.actionIcon} ${styles.danger}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>No hay productos encontrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}