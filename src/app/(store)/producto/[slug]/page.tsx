import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// Opcional: Forzar renderizado dinámico y revalidación
export const revalidate = 0;

async function getProduct(slug: string) {
  // ⚠️ ELIMINA esto - ya no necesitas cookies() aquí
  // const cookieStore = cookies();
  
  // ⚠️ ACTUALIZA: Llama a createClient sin parámetros pero con await
  const supabase = await createClient(); 
  
  const { data, error } = await supabase
    .from('products') 
    .select('*')
    .eq('slug', slug)
    .single(); 

  if (error || !data) {
    return null;
  }
  return data;
}

// Tipado para los parámetros de la URL
interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  // Si el producto no existe, muestra un 404
  if (!product) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Precio: ${product.price}
      </p>
      
      <Button variant="primary">
        Añadir al Carrito (requiere "use client")
      </Button>
    </div>
  );
}