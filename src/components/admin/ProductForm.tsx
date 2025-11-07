"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
// 1. Quita 'createProduct' - la acción vendrá de las props
import { type ProductFormState } from "@/app/admin/products/actions";
import styles from "./ProductForm.module.css";

// 2. AÑADE: Tipos para las props que recibirá el componente
type ProductDefaultValues = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: any;
  [key: string]: any;
} | null;

interface ProductFormProps {
  mode: 'create' | 'edit';
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: ProductDefaultValues;
}

const initialState: ProductFormState = {
  success: false,
  message: "",
};

// 3. ACTUALIZA: SubmitButton para que use 'mode'
function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending 
        ? (mode === 'create' ? 'Creando...' : 'Guardando...')
        : (mode === 'create' ? 'Crear Producto' : 'Guardar Cambios')
      }
    </button>
  );
}

// 4. ACTUALIZA: ProductForm para que acepte las props
export function ProductForm({ mode, action, defaultValues = null }: ProductFormProps) {
  // 5. ACTUALIZA: Usa la 'action' de las props
  const [state, formAction] = useActionState(action, initialState);
  // 6. AÑADE: Variable para la imagen actual
  const currentImageUrl = defaultValues?.images?.[0]?.url;

  return (
    // 7. AÑADE: encType para la subida de archivos
    <form action={formAction} className={styles.form}>
      
      {/* ... (mensajes de estado sin cambios) ... */}
      {state.message && (
        <div className={state.success ? styles.messageSuccess : styles.messageError}>
          {state.message}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="name">Nombre del Producto</label>
        {/* 8. AÑADE: defaultValue */}
        <input 
          type="text" id="name" name="name" required 
          defaultValue={defaultValues?.name}
        />
        {state.errors?.name && (
          <span className={styles.errorText}>{state.errors.name.join(", ")}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="price">Precio (MXN)</label>
        {/* 9. AÑADE: defaultValue */}
        <input 
          type="number" id="price" name="price" step="0.01" min="0" required 
          defaultValue={defaultValues?.price}
        />
        {state.errors?.price && (
          <span className={styles.errorText}>{state.errors.price.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="stock">Stock (Unidades)</label>
        {/* 10. AÑADE: defaultValue */}
        <input 
          type="number" id="stock" name="stock" step="1" min="0" required 
          defaultValue={defaultValues?.stock}
        />
        {state.errors?.stock && (
          <span className={styles.errorText}>{state.errors.stock.join(", ")}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Descripción</label>
        {/* 11. AÑADE: defaultValue */}
        <textarea 
          id="description" name="description" rows={4}
          defaultValue={defaultValues?.description || ''}
        ></textarea>
        {state.errors?.description && (
          <span className={styles.errorText}>{state.errors.description.join(", ")}</span>
        )}
      </div>

      {/* 12. ACTUALIZA: Lógica del campo de imagen */}
      <div className={styles.formGroup}>
        <label htmlFor="image">Imagen del Producto</label>
        
        {/* AÑADE: Vista previa si estamos en modo 'edit' */}
        {mode === 'edit' && currentImageUrl && (
          <div className={styles.imagePreview}>
            <img src={currentImageUrl} alt="Imagen actual" />
            <p>Imagen Actual. Subir una nueva la reemplazará.</p>
          </div>
        )}
        
        <input 
          type="file" 
          id="image" 
          name="image" 
          accept="image/png, image/jpeg, image/webp" 
          // La imagen solo es requerida al crear
          required={mode === 'create'}
        />
        <small>Formatos: JPEG, PNG, WebP. {mode === 'edit' && 'Dejar en blanco para no cambiar.'}</small>
        
        {state.errors?.image && (
          <span className={styles.errorText}>{state.errors.image.join(", ")}</span>
        )}
      </div>

      {/* 13. AÑADE: Campo oculto para 'edit' */}
      {mode === 'edit' && (
        <input 
          type="hidden" 
          name="existingImagePath" 
          value={currentImageUrl || ''} 
        />
      )}

      {/* 14. ACTUALIZA: Pasa 'mode' al botón */}
      <SubmitButton mode={mode} />
    </form>
  );
}