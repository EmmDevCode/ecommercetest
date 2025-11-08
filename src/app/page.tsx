// src/app/page.tsx
import styles from "./page.module.css";
// ProductCard ahora será usado por ProductCarousel
import { createClient } from "@/lib/supabase/server"; 
import { HeroCarousel } from "@/components/home/HeroCarousel";
// ¡NUEVO! Importa los nuevos componentes
import { TypewriterCycle } from "@/components/home/TypewriterCycle";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { Marquee } from "@/components/home/Marquee";
import { Button } from "@/components/ui/Button"; 
import Link from "next/link";

// 1. Define el tipo de producto que esperamos
type ProductWithCategory = {
  id: string;
  name: string;
  price: number;
  images: any; 
  slug: string; 
  product_categories: {
    categories: {
      name: string;
    }
  }[] | null;
};

// 2. Función para cargar productos (ACTUALIZADA)
async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    // 3. ¡ACTUALIZADO! Hacemos el join para traer las categorías
    .select(`
      *, 
      product_categories (
        categories ( name, slug )
      )
    `)
    .eq('active', true)
    .limit(8); // Traemos 8 para el carrusel

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
  // 4. Hacemos un cast al tipo esperado
  return data as ProductWithCategory[];
}


export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className={styles.main}>
      
      {/* --- 1. Hero Carousel (Sin cambios) --- */}
      <section className={styles.darkSection}>
        <div className={styles.heroContainer}>
          <HeroCarousel />
        </div>
      </section>

      {/* --- 2. Typewriter (Sin cambios, puedes borrarlo si ya no va) --- */}
      <section className={styles.typewriterSection}>
        {/* <Typewriter text="Bienvenido al futuro del e-commerce." /> */}
      </section>

      {/* --- 3. Más Vendidos (¡SECCIÓN ACTUALIZADA!) --- */}
      <section className={styles.featured}>
        
        {/* 5. Reemplazamos el título estático por el ciclado */}
        <div className={styles.sectionTitle}>
          <TypewriterCycle 
            baseText="Mejores " 
            words={["Vendidos", "Productos"]} 
          />
        </div>
        
        {/* 6. Reemplazamos el grid por el carrusel */}
        {featuredProducts.length > 0 ? (
          <ProductCarousel products={featuredProducts} />
        ) : (
          <p>No hay productos destacados.</p>
        )}

        <div className={styles.sectionAction}>
          <Link href="/productos">
            <Button variant="secondary">Ver todos los productos</Button>
          </Link>
        </div>
      </section>
      
      {/* --- 4. Categorías (Placeholder) --- */}
      <section className={styles.placeholderSection}>
        <h2 className={styles.sectionTitle}>Categorías</h2>
        <div className={styles.grid}>
          {/* Aquí podrías hacer un map de tus categorías */}
          <div className={styles.placeholderCard}>Categoría 1</div>
          <div className={styles.placeholderCard}>Categoría 2</div>
          <div className={styles.placeholderCard}>Categoría 3</div>
        </div>
      </section>

      {/* --- 5. Nuevo (Usando el mismo carrusel) --- */}
      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>Nuevo</h2>
        {/* Reutilizamos el carrusel, invirtiendo los productos */}
        {featuredProducts.length > 0 ? (
          <ProductCarousel products={[...featuredProducts].reverse()} />
        ) : (
          <p>No hay productos nuevos.</p>
        )}
      </section>
      
      {/* --- 6. Marquee --- */}
      <section className={styles.marqueeSection}>
        <Marquee text="Envíos gratis en compras mayores a $999 · Descuentos de temporada · " />
      </section>
      
      {/* --- 7. News Letter (Placeholder) --- */}
      <section className={styles.newsletterSection}>
        <h2 className={styles.sectionTitle}>News Letter</h2>
        <p>Suscríbete para recibir ofertas exclusivas.</p>
        <form className={styles.newsletterForm}>
          <input type="email" placeholder="tu@email.com" />
          <Button variant="primary">Suscribirse</Button>
        </form>
      </section>

    </main>
  );
}