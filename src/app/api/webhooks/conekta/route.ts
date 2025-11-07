import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "order.paid") {
      const orderData = body.data.object;
      const ourOrderId = orderData.metadata?.our_order_id;
      
      if (!ourOrderId) {
        throw new Error("No se encontró 'our_order_id' en los metadatos");
      }

      // 1. Actualiza el estado del pedido a 'paid'
      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', ourOrderId);

      if (orderError) {
        throw new Error(`Error al actualizar pedido: ${orderError.message}`);
      }
      
      console.log(`Webhook: Pedido ${ourOrderId} actualizado a 'paid'.`);

      // --- ¡NUEVO CÓDIGO AÑADIDO! ---

      // 2. Obtener los items de ese pedido
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', ourOrderId);

      if (itemsError) {
        throw new Error(`Error al obtener items del pedido: ${itemsError.message}`);
      }

      // 3. Crear un array de promesas para descontar el stock
      const stockUpdatePromises = items.map(item => 
        supabaseAdmin.rpc('decrease_stock', { // Llama a la función SQL
          product_id_input: item.product_id,
          quantity_to_decrease: item.quantity
        })
      );

      // 4. Ejecutar todas las actualizaciones de stock
      await Promise.all(stockUpdatePromises);
      
      console.log(`Stock descontado para el pedido ${ourOrderId}.`);
      
      // --- FIN DEL NUEVO CÓDIGO ---
    }

    // 5. Respondemos a Conekta con un 200 OK
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error(`Error en Webhook de Conekta: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}