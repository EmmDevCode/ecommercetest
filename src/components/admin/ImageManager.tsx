// src/components/admin/ImageManager.tsx
"use client";

import { useTransition, useRef } from "react";
import { uploadProductImages, deleteProductImage } from "@/app/(admin)/admin/products/actions";
import { toast } from "sonner";
import styles from './ImageManager.module.css';

interface ImageManagerProps {
  productId: string;
  images: { url: string }[] | null;
}

export function ImageManager({ productId, images = [] }: ImageManagerProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // --- Manejador para SUBIR ---
  const handleUpload = (formData: FormData) => {
    startTransition(async () => {
      const result = await uploadProductImages(productId, formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  // --- Manejador para BORRAR ---
  const handleDelete = (imageUrl: string) => {
    if (confirm("¿Seguro que quieres borrar esta imagen?")) {
      startTransition(async () => {
        const result = await deleteProductImage(productId, imageUrl);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  return (
    <div className={styles.manager}>
      {/* 1. Galería de Imágenes Existentes */}
      <h3>Imágenes Actuales</h3>
      {images && images.length > 0 ? (
        <div className={styles.gallery}>
          {images.map(img => (
            <div key={img.url} className={styles.imageCard}>
              <img src={img.url} alt="Imagen de producto" />
              <button 
                onClick={() => handleDelete(img.url)}
                disabled={isPending}
                className={styles.deleteButton}
              >
                &times; {/* Símbolo X */}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Este producto aún no tiene imágenes.</p>
      )}

      {/* 2. Formulario de Subida */}
      <h3 className={styles.formTitle}>Añadir Nuevas Imágenes</h3>
      <form ref={formRef} action={handleUpload} className={styles.form}>
        <input 
          type="file" 
          name="images" 
          multiple 
          required
          disabled={isPending}
        />
        <button 
          type="submit" 
          disabled={isPending}
          className={styles.uploadButton}
        >
          {isPending ? "Subiendo..." : "Subir Imágenes"}
        </button>
      </form>
    </div>
  );
}