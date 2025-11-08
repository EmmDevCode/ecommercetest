// src/app/(admin)/admin/categories/page.tsx
import { createClient } from "@/lib/supabase/server";
import { CategoryItem } from "@/components/admin/CategoryItem";
import { CategoryForm } from "@/components/admin/CategoryForm";
import styles from './categories.module.css';

// 1. Cargamos las categorías existentes
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
    <div className={styles.page}>
      <h1>Gestionar Categorías</h1>
      
      <div className={styles.layout}>
        <div className={styles.formContainer}>
          <h3>Añadir Nueva Categoría</h3>
          <CategoryForm />
        </div>
        
        <div className={styles.listContainer}>
          <h3>Categorías Existentes</h3>
          {categories.length === 0 ? (
            <p>No hay categorías.</p>
          ) : (
            // 2. Cambia <ul> por <div> y usa el nuevo componente
            <div className={styles.list}>
              {categories.map(cat => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}