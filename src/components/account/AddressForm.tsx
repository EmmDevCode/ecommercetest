// src/components/account/AddressForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createAddress, type AddressFormState } from "@/app/(account)/mi-cuenta/actions";
import { toast } from "sonner";
// Reutilizaremos los estilos del AuthForm para ser rápidos
import styles from "@/components/auth/AuthForm.module.css"; 

// Estado inicial
const initialState: AddressFormState = {
  success: false,
  message: "",
};

// Botón de envío que usa useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending ? "Guardando..." : "Guardar Dirección"}
    </button>
  );
}

export function AddressForm() {
  const [state, formAction] = useActionState(createAddress, initialState);

  // 1. Usar useEffect para mostrar notificaciones con Sonner
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    // 2. El 'key' en el form se usa para resetearlo
    //    después de un envío exitoso
    <form 
      action={formAction}
      key={state.success ? Date.now() : 'static-form'}
      className={styles.form}
    >
      
      {/* Mensaje de error general (opcional, ya usamos toasts) */}
      {!state.success && state.message && state.errors === undefined && (
         <div className={styles.messageError}>{state.message}</div>
      )}

      {/* 3. Campos del formulario (basados en tu Zod schema) */}
      <div className={styles.formGroup}>
        <label htmlFor="street">Calle</label>
        <input type="text" id="street" name="street" required />
        {state.errors?.street && (
          <span className={styles.errorText}>{state.errors.street.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="exterior_num">Número Exterior</label>
        <input type="text" id="exterior_num" name="exterior_num" required />
        {state.errors?.exterior_num && (
          <span className={styles.errorText}>{state.errors.exterior_num.join(", ")}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="interior_num">Número Interior (Opcional)</label>
        <input type="text" id="interior_num" name="interior_num" />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="colony">Colonia</label>
        <input type="text" id="colony" name="colony" required />
        {state.errors?.colony && (
          <span className={styles.errorText}>{state.errors.colony.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="city">Ciudad</label>
        <input type="text" id="city" name="city" required />
        {state.errors?.city && (
          <span className={styles.errorText}>{state.errors.city.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="state">Estado</label>
        <input type="text" id="state" name="state" required />
        {state.errors?.state && (
          <span className={styles.errorText}>{state.errors.state.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="postal_code">Código Postal</label>
        <input type="text" id="postal_code" name="postal_code" required />
        {state.errors?.postal_code && (
          <span className={styles.errorText}>{state.errors.postal_code.join(", ")}</span>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}