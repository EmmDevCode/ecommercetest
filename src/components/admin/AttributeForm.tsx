// src/components/admin/AttributeForm.tsx
"use client";

import { useTransition, useRef } from "react";
import { createAttribute } from "@/app/(admin)/admin/attributes/actions";
import { toast } from "sonner";
// Reutilizamos estilos
import styles from "@/components/admin/ProductForm.module.css"; 

export function AttributeForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createAttribute(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset(); // Limpia el formulario
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Nombre del Atributo</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          disabled={isPending}
          placeholder="Ej: Talla, Color, Almacenamiento"
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending} 
        className={styles.submitButton}
      >
        {isPending ? "Creando..." : "Crear Atributo"}
      </button>
    </form>
  );
}