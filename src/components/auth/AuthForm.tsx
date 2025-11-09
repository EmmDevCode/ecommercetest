// src/components/auth/AuthForm.tsx
"use client";

import Link from 'next/link';
import styles from './AuthForm.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { login, register, type AuthFormState } from '@/app/auth/actions';

// 2. --- ESTADO INICIAL PARA useFormState ---
const initialState: AuthFormState = {
  success: false,
  message: '',
  errors: undefined,
};

// 3. --- COMPONENTE DE BOTÓN PARA MANEJAR "pending" ---
// (useFormStatus debe estar en un componente *hijo* del form)
function FormSubmitButton({ buttonText }: { buttonText: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.primaryButton} disabled={pending}>
      {pending ? 'Procesando...' : buttonText}
    </button>
  );
}

export const AuthForm = () => {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const router = useRouter(); 

  const welcomeTitle = isLogin ? "Bienvenido!" : "Unete ahora!";
  const welcomeText = isLogin ? "No tiene cuenta?" : "Ya tienes cuenta?";
  const welcomeLinkText = isLogin ? "Registrate ahora" : "Incia sesion aqui";
  const welcomeLinkHref = isLogin ? "/register" : "/login";
  
  const formTitle = isLogin ? "Inicio de sesion" : "Registro";
  const buttonText = isLogin ? "Incia sesion" : "Registrame";

  // 4. --- CONECTAR useFormState A LA ACCIÓN CORRESPONDIENTE ---
  const [state, dispatch] = useActionState(
    isLogin ? login : register,
    initialState
  );
  
  // 4. --- AÑADIR ESTE useEffect ---
  useEffect(() => {
    // Si el formulario tuvo éxito (success: true)
    // Y NO es el mensaje de "confirma tu email" (en ese caso, dejamos el modal abierto)
    if (state.success && state.message !== "¡Registro exitoso! Revisa tu email para confirmar tu cuenta.") {
      
      // Esperamos 1 segundo para que el usuario vea el mensaje de éxito
      // y luego cerramos el modal (que es la ruta interceptada)
      const timer = setTimeout(() => {
        router.back();
      }, 1000); 

      // Limpiamos el timer si el componente se desmonta
      return () => clearTimeout(timer);
    }
  }, [state.success, state.message, router]);

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
        
        {/* 5. --- CONECTAR EL FORMULARIO A LA ACCIÓN (dispatch) --- */}
        <form className={styles.form} action={dispatch}>
          
          {/* Campo extra para Registro */}
          {!isLogin && (
            <>
              {/* 6. --- CORRECCIÓN: name="fullName" y id="fullName" --- */}
              <label className={styles.label} htmlFor="fullName">Nombre Completo</label>
              <input 
                className={styles.input} 
                type="text" 
                id="fullName" 
                name="fullName" 
                placeholder="Nombre Apellido" 
                required 
              />
              {/* 7. --- MOSTRAR ERRORES DE VALIDACIÓN (si existen) --- */}
              {state.errors?.fullName && (
                <p className={styles.errorText}>{state.errors.fullName[0]}</p>
              )}
            </>
          )}

          <label className={styles.label} htmlFor="email">Email</label>
          <input 
            className={styles.input} 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Email" 
            required 
          />
          {/* 7. --- MOSTRAR ERRORES DE VALIDACIÓN (si existen) --- */}
          {state.errors?.email && (
            <p className={styles.errorText}>{state.errors.email[0]}</p>
          )}

          <label className={styles.label} htmlFor="password">Contraseña</label>
          <input 
            className={styles.input} 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Contraseña" 
            required 
          />
          {/* 7. --- MOSTRAR ERRORES DE VALIDACIÓN (si existen) --- */}
          {state.errors?.password && (
            <p className={styles.errorText}>{state.errors.password[0]}</p>
          )}

          {isLogin && (
            <div className={styles.checkboxContainer}>
              <input type="checkbox" id="keep-logged-in" />
              <label htmlFor="keep-logged-in">Mantener sesion inciada</label>
            </div>
          )}

          {/* 8. --- MOSTRAR MENSAJE GENERAL DE ÉXITO O ERROR --- */}
          {state.message && (
             <p className={state.success ? styles.successText : styles.errorText}>
               {state.message}
             </p>
           )}

          {/* 9. --- USAR EL NUEVO BOTÓN CON ESTADO "pending" --- */}
          <FormSubmitButton buttonText={buttonText} />
          
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