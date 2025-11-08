// src/components/admin/CategoryForm.tsx
"use client";

import { useTransition, useRef, useEffect } from "react";
import { createCategory } from "@/app//(admin)/admin/categories/actions";
import { toast } from "sonner";
// Reutilizamos estilos
import styles from "@/components/admin/ProductForm.module.css"; 

export function CategoryForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCategory(formData);
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
        <label htmlFor="name">Nombre de la Categoría</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          disabled={isPending}
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending} 
        className={styles.submitButton}
      >
        {isPending ? "Creando..." : "Crear Categoría"}
      </button>
    </form>
  );
}