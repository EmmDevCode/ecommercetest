"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw, Save } from "lucide-react"; // Iconos para mejorar UI
import styles from "./ProductForm.module.css";
import { 
  createProductWithVariants,
  updateProductWithVariants, 
  type ProductFormData,
  type SkuFormData
} from "@/app/(admin)/admin/products/actions";

// --- Tipos ---
type Category = { id: string; name: string; };
type AttributeOption = { id: string; value: string; };
type Attribute = {
  id: string;
  name: string;
  attribute_options: AttributeOption[];
};

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
  defaultValues?: ProductEditData;
}

export function ProductForm({ 
  mode, 
  categoriesData, 
  attributesData,
  defaultValues
}: ProductFormProps) {
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Estados ---
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
  
  // --- Manejadores ---
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
    // Si cambian los atributos base, reseteamos los SKUs para obligar a regenerar
    setSkus([]); 
  };

  // --- Lógica de Variantes (SKUs) ---
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

  const generateSkus = () => {
    const selectedAttributes = attributesData.filter(a => selectedAttributeIds.has(a.id));
    
    if (selectedAttributes.length === 0) {
      // Caso producto simple (sin variantes) - Creamos 1 SKU default
      setSkus([{ price: price, stock: 0, optionIds: [] }]);
      return;
    }

    const combinations = getCombinations(selectedAttributes);
    const newSkus: SkuFormData[] = combinations.map(combo => ({
      price: price, // Hereda el precio base
      stock: 0,
      optionIds: combo
    }));

    setSkus(newSkus);
    toast.success(`Se generaron ${newSkus.length} variantes.`);
  };

  const handleSkuChange = (index: number, field: 'price' | 'stock', value: string) => {
    setSkus(prevSkus => {
      const newSkus = [...prevSkus];
      let numericValue: number | null;
      
      if (field === 'price') {
        const parsedPrice = parseFloat(value);
        numericValue = isNaN(parsedPrice) ? null : parsedPrice;
      } else {
        numericValue = Number(value) || 0;
      }

      newSkus[index] = {
        ...newSkus[index],
        [field]: numericValue,
      };
      return newSkus;
    });
  };

  // --- Envío ---
  const handleSubmit = () => {
  if (!name) return toast.error("El nombre es requerido.");
  if (selectedCategoryIds.size === 0) return toast.error("Elige al menos una categoría.");
  if (skus.length === 0) return toast.error("Debes generar las variantes (SKUs) antes de guardar.");

  const formData: ProductFormData = {
    name,
    description,
    price,
    categoryIds: Array.from(selectedCategoryIds),
    skus: skus,
  };

  startTransition(() => {
    // Definimos una función asíncrona interna para manejar la lógica
    const submitLogic = async () => {
      let result;
      if (mode === 'create') {
        result = await createProductWithVariants(formData);
      } else {
        if (!defaultValues?.id) {
          toast.error("Error: ID no encontrado");
          return;
        }
        result = await updateProductWithVariants(defaultValues.id, formData);
      }
      
      if (result?.success === false) {
        toast.error(result.message);
      } else {
        toast.success(mode === 'create' ? "Producto creado con éxito" : "Producto actualizado");
        if (mode === 'create') router.push('/admin/products');
        else router.refresh();
      }
    };

    // Ejecutamos la lógica (esto retorna una promesa, pero startTransition lo ignora)
    submitLogic(); 
  });
};

  return (
    <div className={styles.formContainer}>
      
      {/* Sección 1: Información General */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información General</h3>
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del Producto</label>
            <input 
              type="text" id="name" 
              className={styles.input}
              placeholder="Ej: Camiseta Básica"
              value={name} onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">Precio Base ($)</label>
            <input 
              type="number" id="price" step="0.01" 
              className={styles.input}
              placeholder="0.00"
              value={price} onChange={(e) => setPrice(Number(e.target.value))} 
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Descripción</label>
          <textarea 
            id="description" rows={3} 
            className={styles.textarea}
            placeholder="Detalles del producto..."
            value={description} onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Sección 2: Categorías */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Categorías</h3>
        <div className={styles.categoriesGrid}>
          {categoriesData.map(cat => (
            <label key={cat.id} className={`${styles.checkboxCard} ${selectedCategoryIds.has(cat.id) ? styles.checked : ''}`}>
              <input 
                type="checkbox" 
                className={styles.hiddenCheckbox}
                checked={selectedCategoryIds.has(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
              /> 
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Sección 3: Atributos y Variantes */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Variantes y Stock</h3>
          <button 
            type="button" 
            onClick={generateSkus} 
            className={styles.secondaryButton}
          >
            <RefreshCw size={16} />
            {skus.length > 0 ? 'Regenerar Tabla' : 'Generar Tabla de Variantes'}
          </button>
        </div>

        <div className={styles.attributesList}>
          <span className={styles.helpText}>Selecciona los atributos que aplican a este producto:</span>
          <div className={styles.checkboxGroup}>
            {attributesData.map(attr => (
              <label key={attr.id} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={selectedAttributeIds.has(attr.id)}
                  onChange={() => handleAttributeToggle(attr.id)}
                /> 
                <span>{attr.name} <small>({attr.attribute_options.length} opciones)</small></span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Variantes Generada */}
      {skus.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.skuTable}>
            <thead>
              <tr>
                <th>Variante / Combinación</th>
                <th>Precio Específico</th>
                <th>Stock Inicial</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku, index) => {
                const variantName = sku.optionIds.length > 0 
                  ? sku.optionIds.map(optId => {
                      for (const attr of attributesData) {
                        const found = attr.attribute_options.find(o => o.id === optId);
                        if (found) return found.value;
                      }
                      return '';
                    }).join(' / ')
                  : 'Producto Único (Sin variantes)';
                
                return (
                  <tr key={index}>
                    <td className={styles.variantName}>{variantName}</td>
                    <td>
                      <div className={styles.inputWrapper}>
                        <span className={styles.prefix}>$</span>
                        <input 
                          type="number" 
                          className={styles.tableInput}
                          value={sku.price === null ? '' : sku.price}
                          onChange={(e) => handleSkuChange(index, 'price', e.target.value)}
                          placeholder={price.toString()} 
                        />
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className={styles.tableInput}
                        value={sku.stock}
                        onChange={(e) => handleSkuChange(index, 'stock', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer de Acciones */}
      <div className={styles.footerActions}>
        <button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isPending}
          className={styles.submitButton}
        >
          {isPending ? (
            <span className={styles.loadingDots}>Guardando...</span>
          ) : (
            <>
              <Save size={18} />
              {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}