/*
 * src/app/page.tsx
 * Tu página de inicio (Home).
*/

// Importa los estilos *específicos* para esta página
import styles from "./page.module.css";
// Importa tu botón reutilizable
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    // Usa la clase 'main' del archivo page.module.css
    <main className={styles.main}>
      
      <div className={styles.hero}>
        <h1>Bienvenido a tu E-Commerce</h1>
        <p>
          Construido con el stack que pediste: Next.js, Supabase, TS, y CSS puro.
        </p>
        <div className={styles.heroActions}>
          <Button variant="primary">Ver Productos</Button>
          <Button variant="secondary">Ir al Admin</Button>
        </div>
      </div>

      <div className={styles.featured}>
        <h2>Productos Destacados</h2>
        <div className={styles.grid}>
          {/* Aquí es donde harías un 'map' de los productos 
            obtenidos desde Supabase (como Server Component) 
          */}
          <div className={styles.productCard}>Producto 1</div>
          <div className={styles.productCard}>Producto 2</div>
          <div className={styles.productCard}>Producto 3</div>
        </div>
      </div>

    </main>
  );
}