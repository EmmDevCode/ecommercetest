import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { updateProduct } from '@/app/admin/products/actions';

// Función de servidor para cargar el producto
async function getProduct(id: string) { // <--- 'id'
  
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id) // <--- 'id' se usa aquí
    .single();

  if (error) {
    console.error("Error al cargar producto - Código:", error.code, "Mensaje:", error.message);
    notFound();
  }
  return data;
}

// --- La Página ---
// Asegúrate de que esta línea sea EXACTAMENTE así:
export default async function EditProductPage({ params }: { params: { id: string } }) {
  
  // Si params.id es 'undefined', aquí es donde falla
  const product = await getProduct(params.id); 

  // El resto del código...
  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <section style={{padding: '2rem'}}>
      <h2>Editar Producto</h2>
      <ProductForm 
        mode="edit"
        action={updateProductWithId}
        defaultValues={product}
      />
    </section>
  );
}