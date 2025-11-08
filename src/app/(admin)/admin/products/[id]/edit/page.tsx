// src/app/(admin)/admin/products/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import type { SkuFormData } from '@/app/(admin)/admin/products/actions';
import { ImageManager } from '@/components/admin/ImageManager';

// 1. Tipos para los datos que cargaremos
type ProductEditData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: { url: string }[] | null;
  categories: { id: string }[]; 
  skus: SkuFormData[];
  attributes: { id: string }[];
};

// 2. Tipos para las respuestas de Supabase
type SupabaseProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: { url: string }[] | null;
  product_categories: Array<{
    categories: {
      id: string;
      name: string;
    };
  }>;
  skus: Array<{
    id: string;
    price: number | null;
    stock: number;
    sku_options: Array<{
      attribute_options: {
        id: string;
        attributes: {
          id: string;
        };
      };
    }>;
  }>;
};

type SupabaseCategory = {
  id: string;
  name: string;
};

type SupabaseAttribute = {
  id: string;
  name: string;
  attribute_options: Array<{
    id: string;
    value: string;
  }>;
};

// 3. Función de carga de datos
async function getProductEditData(id: string) {
  const supabase = await createClient();

  // Verificar si el producto existe
  const { data: productExists, error: existsError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single();

  if (existsError || !productExists) {
    return { 
      defaultValues: null,
      categoriesData: [],
      attributesData: []
    };
  }

  // Cargar datos completos del producto
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      images,
      product_categories ( categories (id, name) ),
      skus (
        id,
        price,
        stock,
        sku_options ( attribute_options ( id, attributes (id) ) )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return { 
      defaultValues: null,
      categoriesData: [],
      attributesData: []
    };
  }

  // Cargar categorías y atributos
  const [{ data: categories }, { data: attributes }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("attributes").select(`id, name, attribute_options ( id, value )`)
  ]);

  // Cast a tipos específicos
  const typedProduct = product as unknown as SupabaseProduct;
  const typedCategories = (categories || []) as SupabaseCategory[];
  const typedAttributes = (attributes || []) as SupabaseAttribute[];

  // Procesar datos
  const defaultValues: ProductEditData = {
    id: typedProduct.id,
    name: typedProduct.name,
    description: typedProduct.description,
    price: typedProduct.price,
    images: Array.isArray(typedProduct.images) ? typedProduct.images : [],
    
    // Categorías
    categories: (typedProduct.product_categories || []).map(pc => ({ 
      id: pc.categories.id 
    })),
    
    // Atributos
    attributes: Array.from(
      new Set(
        (typedProduct.skus || []).flatMap(sku => 
          (sku.sku_options || []).map(so => 
            so.attribute_options.attributes.id
          )
        )
      )
    ).map(id => ({ id })),
    
    // SKUs
    skus: (typedProduct.skus || []).map(sku => ({
      id: sku.id,
      price: sku.price,
      stock: sku.stock,
      optionIds: (sku.sku_options || []).map(so => so.attribute_options.id)
    }))
  };

  return { 
    defaultValues,
    categoriesData: typedCategories,
    attributesData: typedAttributes
  };
}

// --- La Página ---
export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const { defaultValues, categoriesData, attributesData } = await getProductEditData(id);

  // Si no se encuentra el producto, mostrar 404
  if (!defaultValues) {
    notFound();
  }

  return (
    <section style={{ padding: '0 1rem' }}>
      <h2>Editar Producto: {defaultValues.name}</h2>

      <ImageManager 
        productId={defaultValues.id}
        images={defaultValues.images || []}
      />
      
      <ProductForm 
        mode="edit"
        defaultValues={defaultValues}
        categoriesData={categoriesData}
        attributesData={attributesData}
      />
    </section>
  );
}