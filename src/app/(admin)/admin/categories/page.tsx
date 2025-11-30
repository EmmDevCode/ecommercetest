import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { CategoryItem } from '@/components/admin/CategoryItem';
import styles from './categories.module.css';

// 1. Cargamos las categorías existentes (Tu lógica original)
async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });
    
  if (error) {
    console.error("Error al cargar categorías:", error);
    return [];
  }
  return data;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      {/* Header del Nuevo Diseño */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categorías</h1>
          <p className={styles.pageSubtitle}>Organiza tus productos en colecciones.</p>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* Columna Izquierda: Formulario (Sticky) */}
        <div className={styles.formColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Añadir Categoría</h3>
            </div>
            <div className={styles.cardBody}>
              {/* Tu componente funcional */}
              <CategoryForm />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Lista de Categorías */}
        <div className={styles.listColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Categorías Existentes ({categories.length})</h3>
            </div>
            
            <div className={styles.listContainer}>
              {categories.length === 0 ? (
                <div className={styles.emptyState}>No hay categorías registradas.</div>
              ) : (
                // Usamos una lista limpia en lugar de tabla para las categorías
                <div className={styles.list}>
                  {categories.map((cat) => (
                    <CategoryItem key={cat.id} category={cat} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}