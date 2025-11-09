// src/components/layout/Footer.tsx
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* 1. Usamos un contenedor interno para centrar el grid */}
      <div className={styles.footerContainer}>
        
        {/* 2. Grid principal de 4 columnas */}
        <div className={styles.footerGrid}>
          
          {/* Columna 1: Logo y Descripción */}
          <div className={styles.footerColumn}>
            <Link href="/" className={styles.logo}>LOGO</Link>
            <p className={styles.description}>
              Tu tienda de confianza para productos de alta calidad.
            </p>
          </div>
          
          {/* Columna 2: Tienda */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Tienda</h4>
            <Link href="/productos" className={styles.footerLink}>Productos</Link>
            <Link href="/categoria/nuevo" className={styles.footerLink}>Nuevo</Link>
            <Link href="/categoria/vendidos" className={styles.footerLink}>Más Vendidos</Link>
          </div>
          
          {/* Columna 3: Ayuda */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Ayuda</h4>
            <Link href="/sobre-nosotros" className={styles.footerLink}>Sobre Nosotros</Link>
            <Link href="/reseñas" className={styles.footerLink}>Reseñas</Link>
            <Link href="/contacto" className={styles.footerLink}>Contacto</Link>
          </div>
          
          {/* Columna 4: Redes Sociales */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Redes</h4>
            <div className={styles.socialList}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.217.598 1.772 1.153.556.556.9 1.113 1.153 1.772.248.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122s-.013 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.556.556-1.113.9-1.772 1.153-1.066.41-1.636.45-2.428.465-1.066.047-1.405.06-4.122.06s-3.056-.013-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153c-.556-.556-.9-1.113-1.153-1.772C2.217 15.79 2.05 15.064 2.003 14.122 1.953 13.056 1.94 12.717 1.94 12s.01-3.056.06-4.122c.05-1.066.217-1.79.465-2.428C2.719 4.79 3.063 4.233 3.618 3.678c.556-.556 1.113-.9 1.772-1.153C6.21 2.278 6.936 2.11 7.997 2.06 9.064 2.01 9.403 2 12 2zm0 1.8c-2.649 0-2.988.01-4.043.058-1.03.048-1.63.21-2.126.41a2.884 2.884 0 00-1.036.87c-.37.46-.627.97-.87 1.542-.193.58-.34 1.18-.38 2.19-.047 1.05-.058 1.37-.058 4.02s.01 2.96.058 4.02c.04.99.19 1.6.38 2.18.244.56.5 1.07.87 1.54.46.57.97.82 1.54.98.58.19 1.18.34 2.19.38 1.05.048 1.37.058 4.02.058s2.96-.01 4.02-.058c.99-.04 1.6-.19 2.18-.38.56-.24 1.07-.5 1.54-.87.57-.46.82-.97.98-1.54.19-.58.34-1.18.38-2.19.048-1.05.058-1.37.058-4.02s-.01-2.96-.058-4.02c-.04-.99-.19-1.6-.38-2.18a2.89 2.89 0 00-.87-1.54c-.46-.57-.97-.82-1.54-.98-.58-.19-1.18-.34-2.19-.38C15.04 3.81 14.72 3.8 12 3.8zm0 3.6c-3.39 0-6.15 2.76-6.15 6.15s2.76 6.15 6.15 6.15 6.15-2.76 6.15-6.15S15.39 7.4 12 7.4zm0 1.8c2.4 0 4.35 1.95 4.35 4.35s-1.95 4.35-4.35 4.35-4.35-1.95-4.35-4.35 1.95-4.35 4.35-4.35zm4.88-3.3c-.78 0-1.4.62-1.4 1.4s.62 1.4 1.4 1.4 1.4-.62 1.4-1.4-.62-1.4-1.4-1.4z"/></svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* 3. Barra inferior con el copyright */}
        <div className={styles.footerBottom}>
          <p>
            &copy; {currentYear} 
          </p>
          <p>
            En construccion.
          </p>
        </div>

      </div>
    </footer>
  );
};