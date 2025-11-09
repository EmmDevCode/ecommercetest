// src/components/auth/AuthForm.tsx
"use client";

import Link from 'next/link';
// 1. IMPORTANTE: Apunta al NUEVO CSS
import styles from './AuthForm.module.css';
import { usePathname } from 'next/navigation';
// Asumo que tienes un archivo de "server actions", ajústalo si es necesario
// import { login, signup } from '@/app/auth/actions';

export const AuthForm = () => {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  const welcomeTitle = isLogin ? "Bienvenido!" : "Unete ahora!";
  const welcomeText = isLogin ? "No tiene cuenta?" : "Ya tienes cuenta?";
  const welcomeLinkText = isLogin ? "Registrate ahora" : "Incia sesion aqui";
  const welcomeLinkHref = isLogin ? "/register" : "/login";
  
  const formTitle = isLogin ? "Inicio de sesion" : "Registro";
  const buttonText = isLogin ? "Incia sesion" : "Registrame";

  // Puedes cambiar esto por la server action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica de Supabase (login o signup)
  };

  return (
    <div className={styles.authGrid}>
      {/* Columna Izquierda: Welcome! */}
      <div className={styles.welcomeSection}>
        <h2>{welcomeTitle}</h2>
        <p>
          {welcomeText}{' '}
          <Link href={welcomeLinkHref} className={styles.link}>{welcomeLinkText}</Link>
        </p>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className={styles.formSection}>
        <h3>{formTitle}</h3>
        
        {/* Usamos 'form' y no 'formAction' para que funcione en cliente */}
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Campo extra para Registro */}
          {!isLogin && (
            <>
              <label className={styles.label} htmlFor="name">Nombre Completo</label>
              <input className={styles.input} type="text" id="name" name="name" placeholder="Nombre Apellido" required />
            </>
          )}

          <label className={styles.label} htmlFor="email">Email</label>
          <input className={styles.input} type="email" id="email" name="email" placeholder="Email" required />

          <label className={styles.label} htmlFor="password">Contraseña</label>
          <input className={styles.input} type="password" id="password" name="password" placeholder="Contraseña" required />

          {/* Opciones solo para Login */}
          {isLogin && (
            <>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" id="keep-logged-in" />
                <label htmlFor="keep-logged-in">Mantener sesion inciada</label>
              </div>
            </>
          )}

          <button type="submit" className={styles.primaryButton}>{buttonText}</button>
          
          {isLogin && (
            <Link href="/forgot-password" className={styles.forgotPassword}>Olvidates tu contraseña?</Link>
          )}
        </form>

        {/* --- Login Social (Opcional) --- */}
        <div className={styles.socialLogin}>
          <p>o inicia sesion con</p>
          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>G Google</button>
            <button className={styles.socialButton}>f Facebook</button>
            <button className={styles.socialButton}>X Twitter</button>
          </div>
        </div>

      </div>
    </div>
  );
};