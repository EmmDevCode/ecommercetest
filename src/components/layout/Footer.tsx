import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container"> {/* 'container' es de globals.css */}
        <p>
          &copy; {currentYear} Mi E-Commerce. Todos los derechos reservados.
        </p>
        <p>
          Construido con Next.js, Supabase y ☕.
        </p>
      </div>
    </footer>
  );
};