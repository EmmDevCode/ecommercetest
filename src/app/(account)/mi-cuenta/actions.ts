// src/app/mi-cuenta/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Esquema de validación Zod (basado en tu DB 'addresses')
const addressSchema = z.object({
  street: z.string().min(3, "La calle es muy corta"),
  exterior_num: z.string().min(1, "El N° Ext. es requerido"),
  interior_num: z.string().optional().or(z.literal('')), // Es nullable
  colony: z.string().min(3, "La colonia es requerida"),
  city: z.string().min(2, "La ciudad es muy corta"),
  state: z.string().min(2, "El estado es muy corto"),
  postal_code: z.string().min(5, "El C.P. debe tener 5 dígitos"),
});

// 2. Tipo de estado para el formulario
export type AddressFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// --- ACCIÓN CREAR DIRECCIÓN ---
export async function createAddress(
  prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No autorizado" };
  }

  // 3. Validar los campos
  const validatedFields = addressSchema.safeParse({
    street: formData.get("street"),
    exterior_num: formData.get("exterior_num"),
    interior_num: formData.get("interior_num"),
    colony: formData.get("colony"),
    city: formData.get("city"),
    state: formData.get("state"),
    postal_code: formData.get("postal_code"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  // 4. Preparar datos para Supabase
  const addressData = {
    ...validatedFields.data,
    user_id: user.id, // ¡Vincula la dirección al usuario!
  };
  
  // 5. Insertar en la DB (Tu RLS protege esto)
  const { error } = await supabase.from("addresses").insert(addressData);

  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  // 6. Revalidar las páginas que muestran direcciones
  revalidatePath("/mi-cuenta/direcciones");
  revalidatePath("/carrito"); 
  
  return { success: true, message: "Dirección añadida." };
}

// --- ACCIÓN ELIMINAR DIRECCIÓN ---
export async function deleteAddress(addressId: string) {
  if (!addressId) {
    return { success: false, message: "ID de dirección no válido." };
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No autorizado" };
  }

  // Tu RLS protege esta llamada.
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id); // Doble seguridad

  if (error) {
    return { success: false, message: `Error de DB: ${error.message}` };
  }

  revalidatePath("/mi-cuenta/direcciones");
  revalidatePath("/carrito");
  
  return { success: true, message: "Dirección eliminada." };
}