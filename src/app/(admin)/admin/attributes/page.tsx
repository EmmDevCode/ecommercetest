// src/app/(admin)/admin/attributes/page.tsx
import { createClient } from "@/lib/supabase/server";
import { AttributeForm } from "@/components/admin/AttributeForm";
import { AttributeCardItem } from "@/components/admin/AttributeCardItem";
import { AttributeOptionForm } from "@/components/admin/AttributeOptionForm";
import styles from './attributes.module.css';

// 1. Cargamos los atributos CON sus opciones anidadas
async function getAttributes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attributes")
    .select(`
      id,
      name,
      attribute_options ( id, value )
    `)
    .order("name", { ascending: true });
    
  if (error) {
    console.error("Error al cargar atributos:", error);
    return [];
  }
  return data;
}

export default async function AttributesPage() {
  const attributes = await getAttributes();

  return (
    <div className={styles.page}>
      <h1>Gestionar Atributos y Opciones</h1>
      
      <div className={styles.layout}>
        {/* Columna 1: Formulario para añadir Atributo */}
        <div className={styles.formContainer}>
          <h3>Añadir Nuevo Atributo</h3>
          <AttributeForm />
        </div>
        
        {/* Columna 2: Lista de Atributos y sus Opciones */}
        <div className={styles.listContainer}>
          <h3>Atributos Existentes</h3>
          {attributes.length === 0 ? (
            <p>No hay atributos. Crea uno (ej: "Talla").</p>
          ) : (
            <div className={styles.list}>
              {attributes.map(attr => (
                <div key={attr.id} className={styles.attributeCard}>
                  <h4>{attr.name}</h4>
                  
                  {/* Lista de opciones */}
                  <div className={styles.optionsGrid}>
                    {attr.attribute_options.length === 0 ? (
                      <small>Sin opciones. Añade una.</small>
                    ) : (
                      attr.attribute_options.map(opt => (
                        <span key={opt.id} className={styles.optionTag}>
                          {opt.value}
                        </span>
                      ))
                    )}
                  </div>

                  {attributes.map(attr => (
                <AttributeCardItem key={attr.id} attribute={attr} />
              ))}
                  
                  {/* Formulario para añadir nueva opción */}
                  <AttributeOptionForm attributeId={attr.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}