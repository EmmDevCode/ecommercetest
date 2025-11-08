// src/components/auth/SignOutButton.tsx
import { signOut } from "@/app/auth/actions";
// Usaremos el mismo estilo que los otros iconos
import styles from "@/components/layout/Header.module.css"; 

export const SignOutButton = () => {
  return (
    <form action={signOut}>
      <button type="submit" className={styles.iconButton} title="Cerrar Sesión">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </form>
  );
};