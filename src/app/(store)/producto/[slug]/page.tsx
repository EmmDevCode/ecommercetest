// src/app/(store)/producto/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import styles from './product-page.module.css';
import { ProductClientUI } from '@/components/products/ProductClientUI';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link'; // <--- Asegúrate de tener esta importación

export const revalidate = 0;

// --- (Tipo Sku se queda igual) ---
type Sku = {
  id: string;
  price: number | null;
  stock: number;
  product_id: string;
  sku_options: {
    option_id: string;
    attribute_options: {
      value: string;
      attribute_id: string;
      attributes: {
        name: string;
      };
    };
  }[];
};

// --- (Función getProductData se queda igual) ---
async function getProductData(slug: string) {
  const supabase = await createClient(); 
  
  const { data: product, error } = await supabase
    .from('products') 
    .select('*, categories(id, name, slug)')
    .eq('slug', slug)
    .single(); 

  if (error || !product) {
    console.error("Error al cargar producto:", error);
    notFound();
  }

  const { data: skus } = await supabase
    .from('skus')
    .select(`
      id, price, stock, product_id,
      sku_options (
        option_id,
        attribute_options (
          value, attribute_id, attributes ( name )
        )
      )
    `)
    .eq('product_id', product.id);

  const categoryId = product.categories[0]?.id;
  let relatedProducts: any[] = [];
  if (categoryId) {
    const { data } = await supabase
      .from('product_categories')
      .select('products(*)')
      .eq('category_id', categoryId)
      .neq('product_id', product.id)
      .limit(4);
    relatedProducts = data?.map(i => i.products) || [];
  }

  const mockReviews = [
    { id: "r1", user: "Emmanuel D.", rating: 5, comment: "¡Excelente!", photos: [] },
  ];

  return { 
    product,
    skus: (skus || []) as unknown as Sku[], // (Con el fix de 'as unknown')
    reviews: mockReviews, 
    relatedProducts: relatedProducts.filter(Boolean)
  };
}


// --- LA PÁGINA (Server Component) ---
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, skus, reviews, relatedProducts } = await getProductData(slug);

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);

  return (
    <div className={styles.pageContainer}>
      
      <section className={styles.mainSection}>
        
        {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
        {/* Cambia las props antiguas por las nuevas */}
        <ProductClientUI 
          product={product}
          skus={skus}
        />

        {/* --- Info del Producto (Lado Derecho) --- */}
        <div className={styles.infoWrapper}>
          <div className={styles.infoSticky}>
            <span className={styles.category}>
              <Link href={`/categoria/${product.categories[0]?.slug || ''}`}>
                {product.categories[0]?.name || "Sin categoría"}
              </Link>
            </span>
            
            <h1 className={styles.title}>{product.name}</h1>
            
            <span className={styles.price}>{formattedPrice}</span>
            
            <div className={styles.ratingSummary}>
              <div className={styles.stars}>★★★★☆</div>
              <span>({reviews.length} reseñas)</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- (Resto de las secciones) --- */}
      <section className={styles.detailsSection}>
        <h2>Descripción del Producto</h2>
        <p>
          {product.description || "No hay descripción disponible para este producto."}
        </p>
      </section>
      
      <section className={styles.reviewsSection}>
        {/* ... */}
      </section>

      <section className={styles.relatedSection}>
        <h2>También te podría interesar</h2>
        <div className={styles.relatedGrid}>
          {relatedProducts.map((related) => (
            <ProductCard key={related.id} product={related} />
          ))}
        </div>
      </section>
    </div>
  );
}