// src/app/page.tsx
import styles from "./page.module.css";
// ProductCard ahora será usado por ProductCarousel
import { createClient } from "@/lib/supabase/server"; 
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AccordionItem } from "@/components/home/AccordionItem";
import { TypewriterCycle } from "@/components/home/TypewriterCycle";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { User, Tag, Truck, Star } from 'lucide-react';
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
    <div className={styles.main}>
      
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

      {/* --- 3. Más Vendidos (Sin cambios) --- */}
      <section className={styles.featured}>
        <div className={styles.featuredContainer}>
          <div className={styles.bestSellersTitle}>
            <TypewriterCycle 
              baseText="Mejores " 
              words={["Vendidos", "Productos"]} 
            />
          </div>
          
          {featuredProducts.length > 0 ? (
            <ProductCarousel products={featuredProducts} />
          ) : (
            <p>No hay productos destacados.</p>
          )}

          <div className={styles.sectionAction}>
            <Link href="/productos">
            </Link>
          </div>
        </div>
      </section>
      
      {/* --- 4. Categorías (Sin cambios) --- */}
      <section className={styles.categorySection}>
        <div className={styles.featuredContainer}>
          <h2 className={styles.categoryTitle}>Categorías</h2>
          <div className={styles.categoryGrid}>
            <Link href="/categoria/1" className={styles.categoryCard} />
            <Link href="/categoria/2" className={styles.categoryCard} />
            <Link href="/categoria/3" className={styles.categoryCard} />
          </div>
        </div>
      </section>

      {/* --- 5. Nuevo (¡SECCIÓN ACTUALIZADA!) --- */}
      <section className={styles.featured}>
        {/* 1. Añadimos el contenedor para centrar */}
        <div className={styles.featuredContainer}>
        
          {/* 2. Usamos .categoryTitle para el título de la maqueta */}
          <h2 className={styles.categoryTitle}>Nuevo</h2>
          
          {/* Reutilizamos el carrusel, invirtiendo los productos */}
          {featuredProducts.length > 0 ? (
            <ProductCarousel products={[...featuredProducts].reverse()} />
          ) : (
            <p>No hay productos nuevos.</p>
          )}

          {/* 3. Añadimos el botón "Ver todos" para consistencia */}
          <div className={styles.sectionAction}>
            <Link href="/productos">
            </Link>
          </div>
          
        </div>
      </section>
      
      {/* --- 6. Sección Sobre Nosotros (NUEVA) --- */}
      <section className={styles.aboutSection}>
        
        {/* Stack de Marquee + Imagen */}
        <div className={styles.marqueeStack}>
          <div className={styles.marqueeWrapper}>
            <Marquee text="Quienes somos · Que vendemos · Hasta donde llegamos · " speed={30} />
          </div>
          <div className={styles.marqueeImage}>
            {/* La imagen placeholder se aplica con CSS */}
          </div>
        </div>

        {/* Acordeón Neumorfista */}
        <div className={styles.accordionGrid}>
  <AccordionItem title="¿Quiénes somos?" icon={<User size={20} />}>
    <p>Aquí va el texto que responde a "quienes somos". Somos una tienda comprometida con la calidad y el mejor servicio al cliente.</p>
  </AccordionItem>
  <AccordionItem title="¿Qué vendemos?" icon={<Tag size={20} />}>
    <p>Aquí va el texto que responde a "que vendemos". Ofrecemos una amplia gama de productos, desde electrónicos hasta moda y hogar.</p>
  </AccordionItem>
  <AccordionItem title="¿Hasta dónde llegamos?" icon={<Truck size={20} />}>
    <p>Aquí va el texto que responde a "hasta donde llegamos". ¡Enviamos a toda la república con las mejores tarifas!</p>
  </AccordionItem>
  <AccordionItem title="Reseñas" icon={<Star size={20} />}>
    <p>Aquí va el texto que responde a "reseñas". Nuestros clientes nos aman. ¡Lee sus opiniones en la sección de reseñas!</p>
  </AccordionItem>
</div>
      </section>
      
      {/* --- 7. News Letter (¡DISEÑO MAQUETA!) --- */}
      <section className={styles.newsletterSection}>
        {/* 1. Contenedor interno para centrar el contenido (max-width: 600px) */}
        <div className={styles.newsletterContainer}>
          
          <h2 className={styles.newsletterTitle}>News Letter</h2>
          
          <form className={styles.newsletterForm}>
            <label htmlFor="email" className={styles.formLabel}>
              Your email address
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="hello@example.com" 
              className={styles.formInput}
            />
            <div className={styles.formCheckboxWrapper}>
              <input type="checkbox" id="terms" name="terms" />
              <label htmlFor="terms">
                I have read and I agree to the Terms of Use and Privacy policy.
              </label>
            </div>
            {/* 2. Usamos la variante 'dark' que ya creamos */}
            <Button variant="dark">Submit</Button>
          </form>

        </div>
      </section>

    </div>
  );
}