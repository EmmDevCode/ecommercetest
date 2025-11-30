"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateOrderResult = {
  success: boolean;
  message: string;
  url?: string;
};

// 1. Tipo actualizado para la estructura correcta
type CartItemWithSku = {
  id: string;
  quantity: number;
  skus: {
    id: string;
    price: number | null;
    products: {
      id: string;
      name: string;
      price: number;
      images: any;
    } | null;
  } | null;
};

type CartData = {
  id: string;
  cart_items: CartItemWithSku[];
};

export async function createOrderAndPay(
  addressId: string 
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  // --- CONFIGURACIÓN Y VALIDACIÓN ---
  const CONEKTA_KEY = process.env.CONEKTA_API_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  if (!CONEKTA_KEY || !CONEKTA_KEY.startsWith('key_')) {
    console.error("❌ Error: CONEKTA_API_KEY inválida o no encontrada.");
    return { success: false, message: "Error de configuración del sistema de pagos." };
  }

  // --- 1. Obtener Usuario ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Usuario no autenticado." };

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();
  
  // --- 2. Obtener Dirección ---
  const { data: shippingAddress, error: addressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id) 
    .single();

  if (addressError || !shippingAddress) {
    return { success: false, message: "Dirección de envío no válida." };
  }

  // --- 3. Obtener Carrito (LA PARTE QUE FALLABA) ---
  // AQUI ESTA LA CORRECCION CLAVE: pasamos por 'skus'
  const { data: cartData, error: cartError } = await supabase
    .from('carts')
    .select(`
      id,
      cart_items (
        id, 
        quantity,
        skus (
          id,
          price,
          products (
            id, 
            name, 
            price, 
            images
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (cartError || !cartData) {
    console.error("Error al obtener carrito:", cartError);
    // Devolvemos el error detallado por si acaso
    return { 
      success: false, 
      message: `Error al leer carrito: ${cartError?.message || 'Desconocido'}` 
    };
  }

  const typedCartData = cartData as unknown as CartData;

  // Filtrar items válidos
  const validItems = typedCartData.cart_items.filter(item => 
    item.skus && item.skus.products
  );

  if (validItems.length === 0) {
    return { success: false, message: "Tu carrito está vacío o tiene productos inválidos." };
  }

  // --- 4. Calcular Total y Preparar Line Items ---
  let totalInCents = 0;
  
  const conektaLineItems = validItems.map(item => {
    const sku = item.skus!;
    const product = sku.products!;
    
    // Usar precio del SKU si existe, si no el del producto
    const finalPrice = sku.price ?? product.price;
    const unitPriceInCents = Math.round(finalPrice * 100);
    
    totalInCents += unitPriceInCents * item.quantity;
    
    return {
      name: product.name,
      unit_price: unitPriceInCents,
      quantity: item.quantity,
    };
  });
  
  const totalInDecimal = totalInCents / 100;

  // --- 5. Crear Pedido en Supabase ---
  const { data: ourOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalInDecimal,
      status: 'pending',
      shipping_address: shippingAddress,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error al crear pedido:", orderError);
    return { success: false, message: "Error al guardar el pedido." };
  }
  
  // Guardar items del pedido (Usando SKU_ID)
  const orderItemsData = validItems.map(item => {
    const sku = item.skus!;
    const product = sku.products!;
    const finalPrice = sku.price ?? product.price;

    return {
      order_id: ourOrder.id,
      sku_id: sku.id, // Guardamos SKU, no producto genérico
      quantity: item.quantity,
      price_at_purchase: finalPrice,
    };
  });

  const { error: itemsInsertError } = await supabase.from('order_items').insert(orderItemsData);
  
  if (itemsInsertError) {
    console.error("Error insertando items:", itemsInsertError);
    // Intentar limpieza si falla
    await supabase.from('orders').delete().eq('id', ourOrder.id);
    return { success: false, message: "Error al procesar los detalles del pedido." };
  }

  // --- 6. Crear Pedido en Conekta ---
  const customerName = profile?.full_name || user.email || "Cliente";
  const customerPhone = profile?.phone || "+525555555555"; // Valor por defecto seguro

  const conektaBody = {
    currency: "MXN",
    customer_info: {
      name: customerName,
      email: user.email,
      phone: customerPhone,
    },
    line_items: conektaLineItems,
    checkout: {
      type: "HostedPayment",
      allowed_payment_methods: ["card", "cash", "bank_transfer"],
      success_url: `${SITE_URL}/pago/exitoso`,
      failure_url: `${SITE_URL}/pago/fallido`,
      expires_at: Math.floor(Date.now() / 1000) + (60 * 30), // 30 mins
    },
    metadata: {
      our_order_id: ourOrder.id
    }
  };

  try {
    const response = await fetch("https://api.conekta.io/orders", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.conekta-v2.1.0+json",
        "Authorization": `Bearer ${CONEKTA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conektaBody),
    });

    const conektaOrder = await response.json();
    
    if (!response.ok) {
      throw new Error(conektaOrder.details?.[0]?.message || "Error al conectar con pagos");
    }

    // --- 7. Éxito: Actualizar y Limpiar ---
    await supabase
      .from('orders')
      .update({ conekta_order_id: conektaOrder.id })
      .eq('id', ourOrder.id);
      
    // Vaciar carrito
    await supabase.from('cart_items').delete().eq('cart_id', typedCartData.id);

    revalidatePath('/');
    
    return {
      success: true,
      message: "Redirigiendo...",
      url: conektaOrder.checkout?.url,
    };

  } catch (error: any) {
    console.error('❌ Error Pago:', error);
    // Marcar como fallida para no dejarla "pending"
    await supabase.from('orders').update({ status: 'failed' }).eq('id', ourOrder.id);
    
    return { success: false, message: `Error: ${error.message}` };
  }
}