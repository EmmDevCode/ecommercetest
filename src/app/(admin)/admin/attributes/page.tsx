import { createClient } from "@/lib/supabase/server";
import { AttributeForm } from "@/components/admin/AttributeForm";
import { AttributeOptionForm } from "@/components/admin/AttributeOptionForm";
// Importamos tu componente por si lo necesitas, pero aquí maquetaremos la lista completa
// import { AttributeCardItem } from "@/components/admin/AttributeCardItem"; 
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
    <div>
      {/* Header del Nuevo Diseño */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Atributos y Opciones</h1>
          <p className={styles.pageSubtitle}>Define variantes como Talla, Color o Material.</p>
        </div>
      </div>
      
      <div className={styles.layoutGrid}>
        
        {/* Columna 1: Formulario (Sticky) */}
        <div className={styles.formColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Añadir Nuevo Atributo</h3>
            </div>
            <div className={styles.cardBody}>
              <AttributeForm />
            </div>
          </div>
        </div>
        
        {/* Columna 2: Lista de Atributos */}
        <div className={styles.listColumn}>
           {/* Renderizamos cada Atributo como una Tarjeta independiente para dar espacio a sus opciones */}
           <div className={styles.attributesStack}>
             {attributes.length === 0 ? (
               <div className={styles.card}>
                 <div className={styles.emptyState}>
                   No hay atributos registrados. Empieza creando uno (ej: "Color").
                 </div>
               </div>
             ) : (
               attributes.map(attr => (
                 <div key={attr.id} className={styles.card}>
                   
                   {/* Encabezado del Atributo */}
                   <div className={styles.attributeHeader}>
                     <h4 className={styles.attributeName}>{attr.name}</h4>
                     {/* Aquí podrías poner un botón de eliminar atributo si tuvieras la acción */}
                   </div>

                   <div className={styles.cardBody}>
                     <div className={styles.optionsSection}>
                       <span className={styles.label}>Opciones disponibles:</span>
                       
                       {/* Lista de Opciones (Badges) */}
                       <div className={styles.optionsGrid}>
                         {attr.attribute_options.length === 0 ? (
                           <span className={styles.emptyOptions}>Sin opciones.</span>
                         ) : (
                           attr.attribute_options.map(opt => (
                             <span key={opt.id} className={styles.optionTag}>
                               {opt.value}
                             </span>
                           ))
                         )}
                       </div>
                     </div>

                     {/* Formulario Inline para añadir opción */}
                     <div className={styles.addOptionWrapper}>
                       <AttributeOptionForm attributeId={attr.id} />
                     </div>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}