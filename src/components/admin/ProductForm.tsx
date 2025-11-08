// src/components/admin/ProductForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./ProductForm.module.css";
import { 
  createProductWithVariants,
  updateProductWithVariants, 
  type ProductFormData,
  type SkuFormData
} from "@/app/(admin)/admin/products/actions";

// --- 1. Definimos los tipos de props que recibe ---
type Category = { id: string; name: string; };
type AttributeOption = { id: string; value: string; };
type Attribute = {
  id: string;
  name: string;
  attribute_options: AttributeOption[];
};

// 2. Tipo para los valores por defecto
type ProductEditData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categories: { id: string }[];
  skus: SkuFormData[];
  attributes: { id: string }[];
};

interface ProductFormProps {
  mode: 'create' | 'edit';
  categoriesData: Category[];
  attributesData: Attribute[];
  defaultValues?: ProductEditData; // 3. Acepta valores por defecto
}

// --- EL COMPONENTE DE FORMULARIO ---
export function ProductForm({ 
  mode, 
  categoriesData, 
  attributesData,
  defaultValues
}: ProductFormProps) {
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- 4. ESTADOS INICIALIZADOS CON defaultValues ---
  const [name, setName] = useState(defaultValues?.name || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [price, setPrice] = useState(defaultValues?.price || 0);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(defaultValues?.categories.map(c => c.id) || [])
  );
  
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Set<string>>(
    new Set(defaultValues?.attributes.map(a => a.id) || [])
  );

  const [skus, setSkus] = useState<SkuFormData[]>(defaultValues?.skus || []);
  
  // --- (Manejadores handleCategoryToggle, handleAttributeToggle se quedan igual) ---
  const handleCategoryToggle = (id: string) => {
    setSelectedCategoryIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const handleAttributeToggle = (id: string) => {
    setSelectedAttributeIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSkus([]); 
  };

  // --- (Lógica de generateSkus y handleSkuChange se queda igual) ---
  const generateSkus = () => { /* ... (sin cambios) */ };
  const handleSkuChange = (index: number, field: 'price' | 'stock', value: string) => {
    setSkus(prevSkus => {
      const newSkus = [...prevSkus];
      let numericValue: number | null;
      if (field === 'price') {
        // Permite que el precio sea nulo si el campo está vacío
        const parsedPrice = parseFloat(value);
        numericValue = isNaN(parsedPrice) ? null : parsedPrice;
      } else {
        // El stock no puede ser nulo, por defecto es 0
        numericValue = Number(value) || 0;
      }

      newSkus[index] = {
        ...newSkus[index],
        [field]: numericValue,
      };
      return newSkus;
    });
  };
  
  // (Pego la lógica de generateSkus por si acaso)
  const getCombinations = (attributes: Attribute[]): string[][] => {
    if (attributes.length === 0) return [[]];
    const firstAttr = attributes[0];
    const restAttrs = attributes.slice(1);
    const restCombinations = getCombinations(restAttrs);
    const combinations: string[][] = [];
    firstAttr.attribute_options.forEach(option => {
      restCombinations.forEach(combo => {
        combinations.push([option.id, ...combo]);
      });
    });
    return combinations;
  };
  

  // --- 5. ENVÍO DEL FORMULARIO (ACTUALIZADO) ---
  const handleSubmit = () => {
    // ... (Validaciones se quedan igual) ...
    if (!name) return toast.error("El nombre es requerido.");
    if (selectedCategoryIds.size === 0) return toast.error("Elige al menos una categoría.");
    if (skus.length === 0) return toast.error("Debes generar los SKUs.");

    const formData: ProductFormData = {
      name,
      description,
      price,
      categoryIds: Array.from(selectedCategoryIds),
      skus: skus,
    };

    startTransition(async () => {
      let result;
      // 6. Elige la acción correcta basado en el 'mode'
      if (mode === 'create') {
        result = await createProductWithVariants(formData);
      } else {
        // Asegúrate de que defaultValues y su ID existan
        if (!defaultValues?.id) {
          toast.error("Error: No se encontró el ID del producto a editar.");
          return;
        }
        result = await updateProductWithVariants(defaultValues.id, formData);
      }
      
      if (result?.success === false) {
        toast.error(result.message);
      } else {
        toast.success(
          mode === 'create' ? "¡Producto creado!" : "¡Producto actualizado!"
        );
      }
    });
  };

  // --- 9. RENDERIZADO DEL FORMULARIO ---
  return (
    <div className={styles.form}> {/* Usamos <div> en lugar de <form> */}
      
      {/* --- Sección 1: Datos Básicos --- */}
      <div className={styles.formGroup}>
        <label htmlFor="name">Nombre del Producto</label>
        <input type="text" id="name" name="name" required 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="price">Precio Base (MXN)</label>
        <input type="number" id="price" name="price" step="0.01" min="0" required 
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      {/* --- Sección Categorías (Actualizada) --- */}
      <div className={styles.formGroup}>
        <label>Categorías</label>
        <div className={styles.checkboxGrid}>
          {categoriesData.map(cat => (
            <label key={cat.id} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                onChange={() => handleCategoryToggle(cat.id)}
                // 7a. Marca los checkboxes seleccionados
                checked={selectedCategoryIds.has(cat.id)}
              /> {cat.name}
            </label>
          ))}
        </div>
      </div>
      
      {/* --- Sección Atributos (Actualizada) --- */}
      <div className={styles.formGroup}>
        <label>Atributos de Variante</label>
        <div className={styles.checkboxGrid}>
          {attributesData.map(attr => (
            <label key={attr.id} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                onChange={() => handleAttributeToggle(attr.id)}
                // 7b. Marca los checkboxes seleccionados
                checked={selectedAttributeIds.has(attr.id)}
              /> {attr.name} ({attr.attribute_options.map(o => o.value).join(', ')})
            </label>
          ))}
        </div>
        <button type="button" onClick={generateSkus} className={styles.generateButton}>
          Generar {skus.length > 0 ? 'de Nuevo' : ''} las Variantes (SKUs)
        </button>
        {mode === 'edit' && (
          <small>Nota: Al re-generar, se borrarán los precios y stock de las variantes guardadas.</small>
        )}
      </div>
      
      {/* --- Sección 4: Tabla de SKUs --- */}
      {skus.length > 0 && (
        <div className={styles.skuTableWrapper}>
          <table className={styles.skuTable}>
            <thead>
              <tr>
                <th>Variante</th>
                <th>Precio (MXN)</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku, index) => {
                // Construye el nombre de la variante, ej: "M / Rojo"
                const variantName = sku.optionIds.map(optId => {
                  for (const attr of attributesData) {
                    const found = attr.attribute_options.find(o => o.id === optId);
                    if (found) return found.value;
                  }
                  return '';
                }).join(' / ');
                
                return (
                  <tr key={index}>
                    <td>{variantName}</td>
                    <td>
                      <input 
                        type="number" 
                        value={sku.price === null ? '' : sku.price}
                        onChange={(e) => handleSkuChange(index, 'price', e.target.value)}
                        placeholder="Precio"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={sku.stock}
                        onChange={(e) => handleSkuChange(index, 'stock', e.target.value)}
                        placeholder="Stock"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Botón de Envío --- */}
      <button 
        type="button" 
        onClick={handleSubmit} 
        disabled={isPending}
        className={styles.submitButton}
      >
        {isPending 
          ? (mode === 'create' ? 'Creando...' : 'Actualizando...') 
          : (mode === 'create' ? 'Crear Producto' : 'Guardar Cambios')
        }
      </button>
    </div>
  );
}