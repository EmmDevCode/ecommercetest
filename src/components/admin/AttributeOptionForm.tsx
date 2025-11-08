// src/components/admin/AttributeOptionForm.tsx
"use client";

import { useTransition, useRef } from "react";
import { createAttributeOption } from "@/app/(admin)/admin/attributes/actions";
import { toast } from "sonner";
import styles from './AttributeOptionForm.module.css';

interface AttributeOptionFormProps {
  attributeId: string;
}

export function AttributeOptionForm({ attributeId }: AttributeOptionFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createAttributeOption(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className={styles.form}>
      {/* 1. ID del atributo (oculto) */}
      <input type="hidden" name="attribute_id" value={attributeId} />
      
      {/* 2. Campo para el valor */}
      <input 
        type="text" 
        name="value" 
        placeholder="Ej: M, Rojo, 128GB" 
        required
        disabled={isPending}
        className={styles.input}
      />
      
      {/* 3. Botón de envío */}
      <button 
        type="submit" 
        disabled={isPending} 
        className={styles.button}
      >
        {isPending ? "+" : "Añadir"}
      </button>
    </form>
  );
}