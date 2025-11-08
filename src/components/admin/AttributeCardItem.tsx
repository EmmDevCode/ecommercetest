// src/components/admin/AttributeCardItem.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { 
  updateAttribute, 
  deleteAttribute, 
  deleteAttributeOption 
} from "@/app/(admin)/admin/attributes/actions";
import { AttributeOptionForm } from "./AttributeOptionForm";
import styles from './AttributeCardItem.module.css';

// 1. Define el tipo de la prop
type Attribute = {
  id: string;
  name: string;
  attribute_options: Array<{
    id: string;
    value: string;
  }>;
};

export function AttributeCardItem({ attribute }: { attribute: Attribute }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteAttribute = () => {
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
            ⚠️ Confirmar eliminación
          </h3>
          <p style={{ 
            margin: '0',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            ¿Estás seguro de que quieres eliminar el atributo <strong>"{attribute.name}"</strong>? 
            Esta acción eliminará todas sus opciones y no se puede deshacer.
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
                const result = await deleteAttribute(attribute.id);
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
      position: 'top-center', // ✅ Esto lo centra en la parte superior
      duration: Infinity, // No se cierra automáticamente
    });
  };

  // --- Lógica de borrado de OPCIÓN CON SONNER CENTRADO ---
  const handleDeleteOption = (optionId: string, optionValue: string) => {
    toast.custom((t) => (
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        minWidth: '350px',
        maxWidth: '90vw',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🗑️ Eliminar opción
          </h3>
          <p style={{ 
            margin: '0',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            ¿Eliminar la opción <strong>"{optionValue}"</strong>?
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => toast.dismiss(t)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              startTransition(async () => {
                const result = await deleteAttributeOption(optionId);
                if (result.success) {
                  toast.success(result.message, { position: "bottom-right" });
                } else {
                  toast.error(result.message, { position: "bottom-right" });
                }
              });
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ), {
      position: 'top-center', // ✅ Centrado
      duration: Infinity,
    });
  };

  // --- Lógica de Actualización de ATRIBUTO ---
  const handleUpdateAttribute = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateAttribute(formData);
      if (result.success) {
        toast.success(result.message, { position: "bottom-right" });
        setIsEditing(false);
      } else {
        toast.error(result.message, { position: "bottom-right" });
      }
    });
  };
  // --- Renderizado ---
  return (
    <div className={styles.attributeCard}>
      {/* --- Cabecera: Nombre del Atributo (Editable) --- */}
      {isEditing ? (
        <form action={handleUpdateAttribute} className={styles.headerForm}>
          <input type="hidden" name="id" value={attribute.id} />
          <input 
            type="text" 
            name="name" 
            defaultValue={attribute.name} 
            className={styles.input}
            autoFocus 
          />
          <button type="submit" disabled={isPending} className={styles.buttonSave}>
            {isPending ? "..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className={styles.buttonCancel}>
            Cancelar
          </button>
        </form>
      ) : (
        <div className={styles.headerView}>
          <h4>{attribute.name}</h4>
          <div className={styles.actions}>
            <button onClick={() => setIsEditing(true)} className={styles.buttonEdit}>
              Editar
            </button>
            <button onClick={handleDeleteAttribute} disabled={isPending} className={styles.buttonDelete}>
              {isPending ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      )}
      
      {/* --- Cuerpo: Lista de Opciones --- */}
      <div className={styles.optionsGrid}>
        {attribute.attribute_options.length === 0 ? (
          <small>Sin opciones. Añade una.</small>
        ) : (
          attribute.attribute_options.map(opt => (
            <span key={opt.id} className={styles.optionTag}>
              {opt.value}
              <button 
                onClick={() => handleDeleteOption(opt.id, opt.value)}
                disabled={isPending}
                className={styles.deleteOptionButton}
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>
      
      {/* --- Pie: Formulario para añadir nueva opción --- */}
      <AttributeOptionForm attributeId={attribute.id} />
    </div>
  );
}