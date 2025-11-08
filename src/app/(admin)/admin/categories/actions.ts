// app/(admin)/admin/categories/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Tipo para el retorno de las acciones
export type CategoryActionResponse = {
  success: boolean;
  message: string;
};

function createSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

// --- ACCIÓN 1: CREAR ---
export async function createCategory(formData: FormData): Promise<CategoryActionResponse> {
  const name = formData.get("name") as string;
  
  if (!name) {
    return { success: false, message: "El nombre es requerido." };
  }
  
  const slug = createSlug(name);
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug });
    
  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/categories");
  return { success: true, message: "Categoría creada exitosamente." };
}

// --- ACCIÓN 2: ACTUALIZAR ---
export async function updateCategory(formData: FormData): Promise<CategoryActionResponse> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  
  if (!id || !name) {
    return { success: false, message: "Faltan datos (ID o Nombre)." };
  }
  
  const slug = createSlug(name);
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id);
    
  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Categoría actualizada." };
}

// --- ACCIÓN 3: ELIMINAR ---
export async function deleteCategory(categoryId: string): Promise<CategoryActionResponse> {
  if (!categoryId) {
    return { success: false, message: "ID no válido." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
    
  if (error) {
    if (error.code === '23503') {
      return { 
        success: false, 
        message: "Error: No se puede eliminar. La categoría está siendo usada por productos." 
      };
    }
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Categoría eliminada." };
}