"use client";

import { useState, useMemo } from 'react';
import styles from './ProductClientUI.module.css';
import { AddToCartButton } from './AddToCartButton'; 

// --- (Tipos Sku y Product se quedan igual) ---
type Sku = {
  id: string;
  price: number | null;
  stock: number;
  product_id: string;
  sku_options: {
    option_id: string;
    attribute_options: {
      value: string;
      attribute_id: string;
      attributes: {
        name: string; // "Talla" o "Color"
      };
    };
  }[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  images: any;
};

interface ProductClientUIProps {
  product: Product;
  skus: Sku[];
}

export function ProductClientUI({ product, skus = [] }: ProductClientUIProps) {
  
  // --- (Estados de selectedImage y selectedOptions se quedan igual) ---
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.url || '/placeholder-image.png'
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    if (skus[0]) {
      skus[0].sku_options.forEach(opt => {
        initialState[opt.attribute_options.attributes.name] = opt.attribute_options.value;
      });
    }
    return initialState;
  });

  // --- (Lógica de useMemo para 'attributes' y 'selectedSku' se queda igual) ---
  const attributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};
    skus.forEach(sku => {
      sku.sku_options.forEach(opt => {
        const attrName = opt.attribute_options.attributes.name;
        const attrValue = opt.attribute_options.value;
        if (!attrs[attrName]) {
          attrs[attrName] = new Set();
        }
        attrs[attrName].add(attrValue);
      });
    });
    
    return Object.entries(attrs).map(([name, optionsSet]) => ({
      name,
      options: Array.from(optionsSet),
    }));
  }, [skus]);

  const selectedSku = useMemo(() => {
    return skus.find(sku => {
      return sku.sku_options.every(opt => {
        const attrName = opt.attribute_options.attributes.name;
        const attrValue = opt.attribute_options.value;
        return selectedOptions[attrName] === attrValue;
      });
    });
  }, [selectedOptions, skus]);

  // --- (Función handleOptionChange se queda igual) ---
  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  
  return (
    <div className={styles.clientWrapper}>
      
      {/* --- 1. GALERÍA DE IMÁGENES (¡CÓDIGO AÑADIDO!) --- */}
      <div className={styles.gallery}>
        <div className={styles.mainImageWrapper}>
          <img 
            src={selectedImage} 
            alt={product.name} 
            className={styles.mainImage}
          />
        </div>
        <div className={styles.thumbnailList}>
          {product.images?.map((image: any, index: number) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${image.url === selectedImage ? styles.active : ''}`}
              onClick={() => setSelectedImage(image.url)}
            >
              <img src={image.url} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* --- 2. SELECCIÓN DE VARIANTES Y ACCIONES --- */}
      <div className={styles.actions}>
        
        {/* (Esta parte ya estaba correcta con el fix anterior) */}
        {attributes.map(attr => (
          <div key={attr.name} className={styles.variantGroup}>
            <label className={styles.variantLabel}>
              {attr.name}:
              <strong> {selectedOptions[attr.name]}</strong>
            </label>
            <div className={styles.optionList}>
              {attr.options.map(optionValue => (
                <button
                  key={optionValue}
                  onClick={() => handleOptionChange(attr.name, optionValue)}
                  className={`
                    ${styles.optionButton}
                    ${selectedOptions[attr.name] === optionValue ? styles.active : ''}
                  `}
                  title={optionValue}
                >
                  {optionValue}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {/* --- (Botón de Añadir al Carrito se queda igual) --- */}
        <div className={styles.cartButtonWrapper}>
          <AddToCartButton 
            skuId={selectedSku?.id || null} 
            disabled={!selectedSku || selectedSku.stock === 0}
          />
        </div>
        
        {/* --- (Botones secundarios se quedan igual) --- */}
        <div className={styles.secondaryButtons}>
          <button className={styles.iconButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.586l1.318-1.268a4.5 4.5 0 116.364 6.364L12 20.586l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
            Añadir a Favoritos
          </button>
          <button className={styles.iconButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4-4v12" /></svg>
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
}