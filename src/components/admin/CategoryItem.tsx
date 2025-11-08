// src/components/admin/CategoryItem.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { deleteCategory, updateCategory } from "@/app/(admin)/admin/categories/actions";
import styles from './CategoryItem.module.css';

type Category = { id: string; name: string; slug: string; };

export function CategoryItem({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // --- Lógica de Borrado CON SONNER CENTRADO ---
  const handleDelete = () => {
    toast.custom((t) => (
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        minWidth: '400px',
        maxWidth: '90vw',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🗑️ Eliminar categoría
          </h3>
          <p style={{ 
            margin: '0',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            ¿Estás seguro de que quieres eliminar la categoría <strong>"{category.name}"</strong>? 
            Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '16px'
        }}>
          <button
            onClick={() => toast.dismiss(t)}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              startTransition(async () => {
                const result = await deleteCategory(category.id);
                if (result.success) {
                  toast.success(result.message, { position: "bottom-right" });
                } else {
                  toast.error(result.message, { position: "bottom-right" });
                }
              });
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    ), {
      position: 'top-center', // ✅ Centrado en la parte superior
      duration: Infinity, // No se cierra automáticamente
    });
  };

  // --- Lógica de Actualización ---
  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateCategory(formData);
      if (result.success) {
        toast.success(result.message, { position: "bottom-right" });
        setIsEditing(false);
      } else {
        toast.error(result.message, { position: "bottom-right" });
      }
    });
  };

  // --- Renderizado ---
  if (isEditing) {
    return (
      <form ref={formRef} action={handleUpdate} className={styles.item}>
        <input type="hidden" name="id" value={category.id} />
        <input 
          type="text" 
          name="name" 
          defaultValue={category.name} 
          className={styles.input}
          autoFocus
          disabled={isPending}
        />
        <div className={styles.actions}>
          <button type="submit" disabled={isPending} className={styles.buttonSave}>
            {isPending ? "Guardando..." : "Guardar"}
          </button>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)} 
            disabled={isPending}
            className={styles.buttonCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{category.name}</span>
        <small className={styles.slug}>Slug: {category.slug}</small>
      </div>
      <div className={styles.actions}>
        <button 
          onClick={() => setIsEditing(true)} 
          className={styles.buttonEdit}
        >
          Editar
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isPending} 
          className={styles.buttonDelete}
        >
          {isPending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}