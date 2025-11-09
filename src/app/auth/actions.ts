"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// --- Tipado para las respuestas del formulario ---
export type AuthFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// --- Esquema de Validación para REGISTRO ---
const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre es muy corto"),
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// --- Esquema de Validación para LOGIN ---
const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
});

// --- ACCIÓN DE REGISTRO ---
export async function register(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createClient();

  const validatedFields = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validación fallida",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { fullName, email, password } = validatedFields.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Esto es el 'raw_user_meta_data' que el Trigger SQL usará
        full_name: fullName, 
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: `Error al registrar: ${error.message}`,
    };
  }

  // Supabase por defecto requiere confirmación de email
  if (data.user && !data.session) {
     return {
      success: true,
      message: "¡Registro exitoso! Revisa tu email para confirmar tu cuenta.",
    };
  }

  // Si la confirmación de email está desactivada, redirige
  revalidatePath("/", "layout"); 
  return {
    success: true,
    message: "¡Registro exitoso! Iniciando sesión...",
  };
  // ⛔️ ELIMINAR: redirect("/");
}

// --- ACCIÓN DE LOGIN ---
export async function login(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createClient();

  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validación fallida",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: `Error al iniciar sesión: ${error.message}`,
    };
  }

  // 3. --- CAMBIO EN LOGIN ---
  // ¡Éxito! Revalida el layout (para el header) y devuelve un mensaje.
  revalidatePath("/", "layout");
  return {
    success: true,
    message: "¡Sesión iniciada correctamente!",
  };
  // ⛔️ ELIMINAR: redirect("/");
}

// --- ACCIÓN DE CERRAR SESIÓN ---
export async function signOut() {
  // ⚠️ ELIMINA esta línea
  // const cookieStore = cookies();
  
  // ⚠️ ACTUALIZA: usa await con createClient()
  const supabase = await createClient();

  // Cierra la sesión en Supabase (borra la cookie)
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión:", error.message);
    // Opcional: manejar el error, aunque es raro que falle
    return;
  }
  
  // Redirige al inicio después de cerrar sesión
  redirect("/");
}