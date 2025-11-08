"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Tipo para la respuesta de la acción
export type CartActionResult = {
  success: boolean;
  message: string;
};

/**
 * Añade un producto al carrito del usuario actual.
 */
export async function addToCart(
  skuId: string // <-- 1. Recibe 'skuId', no 'productId'
): Promise<CartActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  try {
    // 2. Obtener el carrito del usuario
    const { data: existingCart, error: cartFetchError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let cartId;
    if (cartFetchError || !existingCart) {
      // Crear carrito si no existe
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (createError || !newCart) throw new Error("No se pudo crear el carrito.");
      cartId = newCart.id;
    } else {
      cartId = existingCart.id;
    }

    // 3. Verificar si el SKU ya está en el carrito
    const { data: existingItem, error: findError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('sku_id', skuId) // <-- 4. Buscar por 'sku_id'
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    if (existingItem) {
      // 5. SI EXISTE: Actualizar cantidad
      const newQuantity = existingItem.quantity + 1;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      if (updateError) throw updateError;
      
    } else {
      // 6. NO EXISTE: Insertar nuevo item con 'sku_id'
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          sku_id: skuId, // <-- 7. Usar 'sku_id'
          quantity: 1,
        });
      if (insertError) throw insertError;
    }

    revalidatePath('/'); 
    revalidatePath('/carrito');

    return { success: true, message: "¡Producto añadido!" };

  } catch (error: any) {
    return {
      success: false,
      message: `Error al añadir al carrito: ${error.message}`,
    };
  }
}

// --- ACCIÓN DE ELIMINAR ITEM ---
export async function removeItem(
  cartItemId: string
): Promise<CartActionResult> {
  const supabase = await createClient();

  // 1. Verificar usuario (aunque RLS lo protege, es buena práctica)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  try {
    // 2. Eliminar el item
    // ¡La política RLS que creamos asegura que el usuario
    // solo pueda borrar items de SU PROPIO carrito!
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    // 3. Revalidar la página del carrito para que se actualice
    revalidatePath('/carrito');
    // También revalidamos el layout para el ícono del carrito
    revalidatePath('/'); 

    return { success: true, message: "Item eliminado." };

  } catch (error: any) {
    return {
      success: false,
      message: `Error al eliminar item: ${error.message}`,
    };
  }
}

// --- ACCIÓN DE ACTUALIZAR CANTIDAD ---
export async function updateQuantity(
  cartItemId: string,
  newQuantity: number
): Promise<CartActionResult> {
  
  const supabase = await createClient();

  // 1. Validar la cantidad
  const quantitySchema = z.number().int().min(1, "La cantidad debe ser al menos 1");
  const validation = quantitySchema.safeParse(newQuantity);

  if (!validation.success) {
    return { success: false, message: "Cantidad no válida." };
  }

  // 2. Verificar usuario (seguridad)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Debes iniciar sesión." };
  }

  try {
    // 3. Actualizar el item (RLS nos protege)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: validation.data })
      .eq('id', cartItemId); // RLS implícitamente también comprueba el user_id

    if (error) throw error;

    // 4. Revalidar la página del carrito
    revalidatePath('/carrito');

    return { success: true, message: "Cantidad actualizada." };

  } catch (error: any) {
    return {
      success: false,
      message: `Error al actualizar: ${error.message}`,
    };
  }
}