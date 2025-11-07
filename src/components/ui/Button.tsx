import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
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