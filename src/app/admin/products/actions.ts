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
export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  
  const validatedFields = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, description, price, stock, image } = validatedFields.data;
  
  // --- USANDO TU ESTILO ---
  const supabase = await createClient();
  // ---
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .single();

  if (profileError || profile?.role !== "admin") {
     return { success: false, message: "Acción no autorizada." };
  }

  // Lógica de subida de imagen...
  let imageUrls = [];
  try {
    const file = image;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error("No se pudo obtener la URL pública.");
    }
    imageUrls.push({ url: publicUrlData.publicUrl });

  } catch (error: any) {
    return { success: false, message: `Error de imagen: ${error.message}` };
  }
  
  // Insertar en DB
  const slug = createSlug(name);
  const { data, error } = await supabase
    .from("products")
    .insert([{ name, description, price, stock, slug, images: imageUrls }])
    .select();

  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  revalidatePath("/admin/products");
  return { success: true, message: "Producto creado exitosamente." };
}

// --- Acción ACTUALIZAR PRODUCTO ---
export async function updateProduct(
  productId: string,
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  
  const validatedFields = updateProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    image: formData.get("image"),
    existingImagePath: formData.get("existingImagePath"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // --- USANDO TU ESTILO ---
  const supabase = await createClient();
  // ---
  
  const { data: profile } = await supabase.from("profiles").select("role").single();
  if (profile?.role !== "admin") {
    return { success: false, message: "Acción no autorizada." };
  }

  const { name, description, price, stock, image, existingImagePath } = validatedFields.data;
  const updateData: any = {
    name, description, price, stock,
    slug: createSlug(name),
  };

  try {
    if (image && image.size > 0) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, image);

      if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      updateData.images = [{ url: publicUrlData.publicUrl }];

      if (existingImagePath) {
        const oldFileName = existingImagePath.split('/').pop();
        if (oldFileName) {
          await supabaseAdmin.storage
            .from('product-images')
            .remove([`public/${oldFileName}`]);
        }
      }
    }
  } catch (error: any) {
    return { success: false, message: `Error de imagen: ${error.message}` };
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update(updateData)
    .eq("id", productId);

  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  redirect('/admin/products');
}