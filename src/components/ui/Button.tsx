import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // 1. CAMBIO: Añadimos 'dark' a las opciones de variante
  variant?: 'primary' | 'secondary' | 'dark';
}

/**
 * Un componente de botón reutilizable con CSS Modules
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  ...props 
}: ButtonProps) => {
  
  // Combina clases de CSS Modules
  const className = `${styles.button} ${styles[variant]}`;

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};