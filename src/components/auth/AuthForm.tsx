"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/app/auth/actions";
import styles from "./AuthForm.module.css"; // Usaremos el mismo estilo del admin

// Estado inicial para el formulario
const initialState: AuthFormState = {
  success: false,
  message: "",
};

// Botón de envío que se deshabilita solo
function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending
        ? mode === "login" ? "Iniciando..." : "Registrando..."
        : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
    </button>
  );
}

interface AuthFormProps {
  mode: "login" | "register";
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      
      {/* Mensaje de éxito (ej. "Revisa tu email") o error */}
      {state.message && (
        <div className={state.success ? styles.messageSuccess : styles.messageError}>
          {state.message}
        </div>
      )}

      {/* Campo extra solo para registro */}
      {mode === "register" && (
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Nombre Completo</label>
          <input type="text" id="fullName" name="fullName" required />
          {state.errors?.fullName && (
            <span className={styles.errorText}>{state.errors.fullName.join(", ")}</span>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
        {state.errors?.email && (
          <span className={styles.errorText}>{state.errors.email.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Contraseña</label>
        <input type="password" id="password" name="password" required />
        {state.errors?.password && (
          <span className={styles.errorText}>{state.errors.password.join(", ")}</span>
        )}
      </div>

      <SubmitButton mode={mode} />
    </form>
  );
}