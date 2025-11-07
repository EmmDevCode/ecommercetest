import { ProductForm } from "@/components/admin/ProductForm";
// 1. Importa la acción de 'crear'
import { createProduct } from "@/app/admin/products/actions"; 

export default function NewProductPage() {
  return (
    <section style={{padding: '2rem'}}>
      <h2>Crear Nuevo Producto</h2>
      <p>Rellena los datos para el nuevo producto.</p>
      
      {/* 2. Pasa las props REQUERIDAS */}
      <ProductForm 
        mode="create"
        action={createProduct}
        // No pasamos 'defaultValues', por lo que estará vacío
      />
    </section>
  );
}