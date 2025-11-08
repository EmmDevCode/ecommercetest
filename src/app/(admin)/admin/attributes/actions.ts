// src/app/admin/attributes/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- ACCIÓN 1: CREAR ATRIBUTO (Ej: "Talla") ---
export async function createAttribute(formData: FormData) {
  const attributeName = formData.get("name") as string;
  if (!attributeName) {
    return { success: false, message: "El nombre es requerido." };
  }
  
  const supabase = await createClient();
  
  // Tu RLS de admin protege esta inserción
  const { error } = await supabase
    .from("attributes")
    .insert({ name: attributeName });
    
  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Atributo creado." };
}


// --- ACCIÓN 2: CREAR OPCIÓN DE ATRIBUTO (Ej: "M") ---
export async function createAttributeOption(formData: FormData) {
  const optionValue = formData.get("value") as string;
  const attributeId = formData.get("attribute_id") as string;
  
  if (!optionValue || !attributeId) {
    return { success: false, message: "Faltan datos." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("attribute_options")
    .insert({ 
      attribute_id: attributeId,
      value: optionValue 
    });
    
  if (error) {
    // Manejo de error común: "Talla M" ya existe
    if (error.code === '23505') { // unique_violation
       return { success: false, message: "Esa opción ya existe para este atributo." };
    }
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Opción añadida." };
}

export async function updateAttribute(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  
  if (!id || !name) {
    return { success: false, message: "Faltan datos (ID o Nombre)." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("attributes")
    .update({ name })
    .eq("id", id);
    
  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Atributo actualizado." };
}

// --- ACCIÓN 4: ELIMINAR ATRIBUTO (¡Nueva!) ---
export async function deleteAttribute(attributeId: string) {
  if (!attributeId) {
    return { success: false, message: "ID no válido." };
  }
  
  const supabase = await createClient();
  
  // Tu SQL 'ON DELETE CASCADE' se encargará de borrar las 'attribute_options'
  const { error } = await supabase
    .from("attributes")
    .delete()
    .eq("id", attributeId);
    
  if (error) {
    // Error '23503': Foreign Key Violation
    // Esto significa que un SKU (sku_options) está usando una de las opciones de este atributo.
    if (error.code === '23503') {
      return { 
        success: false, 
        message: "Error: No se puede eliminar. Atributo en uso por productos." 
      };
    }
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Atributo eliminado." };
}

// --- ACCIÓN 5: ELIMINAR OPCIÓN DE ATRIBUTO (¡Nueva!) ---
export async function deleteAttributeOption(optionId: string) {
  if (!optionId) {
    return { success: false, message: "ID de opción no válido." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("attribute_options")
    .delete()
    .eq("id", optionId);
    
  if (error) {
    // Manejo de error si la opción está en uso
    if (error.code === '23503') {
      return { 
        success: false, 
        message: "Error: No se puede eliminar. Opción en uso por productos." 
      };
    }
    return { success: false, message: `Error de DB: ${error.message}` };
  }
  
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/products/new");
  
  return { success: true, message: "Opción eliminada." };
}