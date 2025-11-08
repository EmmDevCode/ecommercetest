"use server";

import { createClient } from "@/lib/supabase/server"; // Tu cliente
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Función Helper ---
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export type SkuFormData = {
  price: number | null;
  stock: number;
  optionIds: string[]; // Ej: [id_de_talla_M, id_de_color_Rojo]
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number; // Precio base
  // 'images' se manejará por separado
  categoryIds: string[]; // Array de UUIDs de categorías
  skus: SkuFormData[];   // Array de SKUs a crear
};

// --- Esquema para CREAR (requiere imagen) ---
const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  image: z.instanceof(File).refine(file => file.size > 0, "Se requiere una imagen."),
});

// --- Esquema para ACTUALIZAR (imagen opcional) ---
const updateProductSchema = productSchema.extend({
  image: z.instanceof(File).optional(),
  existingImagePath: z.string().optional(),
});

// --- Tipo de Estado del Formulario ---
export type ProductFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// --- Acción CREAR PRODUCTO ---
export async function createProductWithVariants(data: ProductFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No autorizado" };
  }
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { success: false, message: "Acción no autorizada." };
  }

  // ¡Importante! Usamos el cliente ADMIN para transacciones
  const adminClient = supabaseAdmin;

  let newProduct: { id: string; [key: string]: any; };

  try {
    // 2b. Crear el Producto base
    const slug = createSlug(data.name);
    const { data: productData, error: productError } = await adminClient
      .from("products")
      .insert({
        name: data.name,
        description: data.description,
        price: data.price,
        slug: slug,
      })
      .select()
      .single();

    // 2c. Asignar el valor a la variable
    if (productError) throw productError;
    if (!productData) throw new Error("No se pudo crear el producto.");
    newProduct = productData;

    // 2d. Asignar Categorías
    const categoryLinks = data.categoryIds.map(catId => ({
      product_id: newProduct.id,
      category_id: catId,
    }));
    const { error: categoryError } = await adminClient
      .from("product_categories")
      .insert(categoryLinks);
    
    if (categoryError) throw categoryError;

    // 2e. Crear los SKUs y sus Opciones
    for (const skuData of data.skus) {
      // i. Crear el SKU
      const { data: newSku, error: skuError } = await adminClient
        .from("skus")
        .insert({
          product_id: newProduct.id,
          price: skuData.price,
          stock: skuData.stock,
        })
        .select()
        .single();
      
      if (skuError) throw skuError;
      if (!newSku) throw new Error("No se pudo crear el SKU.");

      // ii. Vincular las opciones
      const skuOptionLinks = skuData.optionIds.map(optId => ({
        sku_id: newSku.id,
        option_id: optId,
      }));
      const { error: skuOptionError } = await adminClient
        .from("sku_options")
        .insert(skuOptionLinks);
      
      if (skuOptionError) throw skuOptionError;
    }

    // 3. Mover la revalidación DENTRO del try
    revalidatePath("/admin/products");

  } catch (error: any) {
    // Si algo falla, devuelve el error
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  // 4. Ahora 'newProduct' SÍ existe aquí
  redirect(`/admin/products/${newProduct.id}/edit`);
}

// --- Acción ACTUALIZAR PRODUCTO ---
export async function updateProductWithVariants(
  productId: string,
  data: ProductFormData
) {
  
  // 1. Autenticación y Verificación de Admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No autorizado" };
  }
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { success: false, message: "Acción no autorizada." };
  }

  const adminClient = supabaseAdmin;

  try {
    // 2. Actualizar el Producto base
    const slug = createSlug(data.name);
    const { error: productError } = await adminClient
      .from("products")
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        slug: slug,
      })
      .eq("id", productId);

    if (productError) throw productError;

    // 3. Actualizar Categorías (Método "Borrar y Re-crear")
    // 3a. Borrar links antiguos
    await adminClient
      .from("product_categories")
      .delete()
      .eq("product_id", productId);
    
    // 3b. Insertar links nuevos
    const categoryLinks = data.categoryIds.map(catId => ({
      product_id: productId,
      category_id: catId,
    }));
    await adminClient.from("product_categories").insert(categoryLinks);

    // 4. Actualizar SKUs (Método "Borrar y Re-crear")
    // (Esto es mucho más seguro que intentar un 'diff')
    
    // 4a. Borrar SKUs antiguos (esto borrará 'sku_options' en cascada)
    await adminClient
      .from("skus")
      .delete()
      .eq("product_id", productId);
      
    // 4b. Re-crear todos los SKUs desde el formulario
    for (const skuData of data.skus) {
      // i. Crear el SKU
      const { data: newSku, error: skuError } = await adminClient
        .from("skus")
        .insert({
          product_id: productId, // Usa el ID del producto existente
          price: skuData.price,
          stock: skuData.stock,
        })
        .select("id")
        .single();
      
      if (skuError) throw skuError;

      // ii. Vincular las opciones
      const skuOptionLinks = skuData.optionIds.map(optId => ({
        sku_id: newSku.id,
        option_id: optId,
      }));
      await adminClient.from("sku_options").insert(skuOptionLinks);
    }

  } catch (error: any) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  // 5. Éxito
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  redirect(`/admin/products`); // Vuelve a la lista de productos
}

// --- ACCIÓN 3: SUBIR IMÁGENES DE PRODUCTO ---
export async function uploadProductImages(productId: string, formData: FormData) {
  
  const images = formData.getAll("images") as File[];
  if (!images || images.length === 0) {
    return { success: false, message: "No se seleccionaron imágenes." };
  }

  // Verificar admin (¡siempre!)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ... (tu lógica de verificación de perfil de admin iría aquí) ...

  const adminClient = supabaseAdmin;
  const imageUrls: { url: string }[] = [];

  try {
    // 1. Sube cada imagen al Storage
    for (const file of images) {
      if (file.size === 0) continue;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await adminClient.storage
        .from('product-images') // Asegúrate que tu bucket se llame así
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw new Error(`Error al subir ${file.name}: ${uploadError.message}`);

      // 2. Obtiene la URL pública
      const { data: publicUrlData } = adminClient.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      if (!publicUrlData.publicUrl) throw new Error("No se pudo obtener la URL pública.");
      imageUrls.push({ url: publicUrlData.publicUrl });
    }

    // 3. Obtiene el JSON de imágenes existente
    const { data: product } = await adminClient
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();

    // 4. Combina las imágenes antiguas con las nuevas
    const existingImages = product?.images || [];
    const updatedImages = [...existingImages, ...imageUrls];

    // 5. Actualiza la columna 'images' del producto
    const { error: dbError } = await adminClient
      .from("products")
      .update({ images: updatedImages })
      .eq("id", productId);

    if (dbError) throw dbError;

  } catch (error: any) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true, message: "Imágenes subidas." };
}

// --- ACCIÓN 4: BORRAR UNA IMAGEN DE PRODUCTO ---
export async function deleteProductImage(productId: string, imageUrl: string) {
  // ... (Verificar admin) ...
  const adminClient = supabaseAdmin;

  try {
    // 1. Obtiene las imágenes actuales
    const { data: product } = await adminClient
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();

    if (!product || !product.images) {
      return { success: false, message: "Producto no encontrado." };
    }

    // 2. Filtra la imagen que queremos borrar
    const updatedImages = product.images.filter((img: any) => img.url !== imageUrl);

    // 3. Actualiza la base de datos
    await adminClient
      .from("products")
      .update({ images: updatedImages })
      .eq("id", productId);

    // 4. Borra el archivo del Storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await adminClient.storage
        .from('product-images')
        .remove([`public/${fileName}`]);
    }

  } catch (error: any) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true, message: "Imagen eliminada." };
}