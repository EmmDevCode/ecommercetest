"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Importa el cliente ADMIN
import { revalidatePath } from "next/cache";

// Lista de estados válidos (para seguridad)
const validStatuses = [
    'pending', 'paid', 'processing', 'shipped',
    'in_transit', 'out_for_delivery', 'delivered', 'cancelled'
];

export async function updateOrderStatus(orderId: string, newStatus: string) {
  // 1. Validar el input
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: "Estado no válido." };
  }

  // 2. Seguridad: Verificar que el usuario actual es ADMIN
  const supabase = await createClient(); // ← Cambio aquí

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return { success: false, message: "Acción no autorizada." };
    }
  } else {
    return { success: false, message: "No autenticado." };
  }

  // 3. (Autorizado) Usar el cliente ADMIN para actualizar el pedido
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) throw error;

    // 4. Revalidar el caché de la página para ver el cambio
    revalidatePath('/admin/orders');
    return { success: true, message: "Estado actualizado." };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}