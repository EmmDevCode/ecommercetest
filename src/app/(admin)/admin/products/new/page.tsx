// src/app/(admin)/admin/products/new/page.tsx
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";
 

// 1. Cargamos las categorías y atributos desde el servidor
async function getFormData() {
  const supabase = await createClient();
  
  // Carga todas las categorías
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name");
    
  // Carga todos los atributos CON sus opciones
  const { data: attributes } = await supabase
    .from("attributes")
    .select(`
      id, 
      name,
      attribute_options ( id, value )
    `);

  return { 
    categories: categories || [],
    attributes: attributes || [] 
  };
}

export default async function NewProductPage() {
  // 2. Obtenemos los datos
  const { categories, attributes } = await getFormData();

  return (
    <section style={{padding: '0 1rem'}}>
      <h2>Crear Nuevo Producto</h2>
      
      {/* 3. Pasamos los datos al formulario cliente */}
      <ProductForm 
        mode="create"
        categoriesData={categories}
        attributesData={attributes}
      />
    </section>
  );
}