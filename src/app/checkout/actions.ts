"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateOrderResult = {
  success: boolean;
  message: string;
  url?: string;
};

type CartItemWithProduct = {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    images: any;
  } | null;
};

type CartData = {
  id: string;
  cart_items: CartItemWithProduct[];
};

export async function createOrderAndPay(): Promise<CreateOrderResult> {
  const supabase = await createClient();

  // --- VERIFICACIÓN INICIAL DE API KEY ---
  const CONEKTA_KEY = process.env.CONEKTA_API_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  if (!CONEKTA_KEY) {
    console.error("❌ CONEKTA_API_KEY no está configurada en las variables de entorno");
    return { success: false, message: "Error de configuración del sistema de pagos." };
  }

  if (!CONEKTA_KEY.startsWith('key_')) {
    console.error("❌ CONEKTA_API_KEY tiene formato inválido:", CONEKTA_KEY);
    return { success: false, message: "Configuración incorrecta del sistema de pagos." };
  }

  console.log('🔑 Usando API Key:', CONEKTA_KEY.substring(0, 10) + '...');

  // --- 1. Obtener Usuario y Carrito ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Usuario no autenticado." };
  }

  // Obtener el perfil del usuario para el nombre
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: cartData, error: cartError } = await supabase
    .from('carts')
    .select(`
      id,
      cart_items (
        id, 
        quantity,
        products (
          id, 
          name, 
          price, 
          images
        )
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (cartError || !cartData) {
    console.error("Error al obtener carrito:", cartError);
    return { success: false, message: "Error al obtener el carrito." };
  }

  const typedCartData = cartData as unknown as CartData;

  if (!typedCartData.cart_items || typedCartData.cart_items.length === 0) {
    return { success: false, message: "Tu carrito está vacío." };
  }

  const items = typedCartData.cart_items.filter(item => 
    item.products !== null && 
    typeof item.products === 'object' && 
    !Array.isArray(item.products) &&
    item.products.id !== null
  );

  if (items.length === 0) {
    return { success: false, message: "No hay productos válidos en el carrito." };
  }

  // --- 2. Calcular Total ---
  let totalInCents = 0;
  const conektaLineItems = items.map(item => {
    const product = item.products!;
    const unitPriceInCents = Math.round(product.price * 100);
    totalInCents += unitPriceInCents * item.quantity;
    
    return {
      name: product.name,
      unit_price: unitPriceInCents,
      quantity: item.quantity,
    };
  });
  
  const totalInDecimal = totalInCents / 100;

  // --- 3. Crear Pedido en Supabase ---
  const dummyAddress = { street: "Por definir", city: "Por definir" };

  const { data: ourOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalInDecimal,
      status: 'pending',
      shipping_address: dummyAddress, 
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error al crear pedido en Supabase:", orderError);
    return { success: false, message: "Error al guardar el pedido." };
  }
  
  const orderItemsData = items.map(item => ({
    order_id: ourOrder.id,
    product_id: item.products!.id,
    quantity: item.quantity,
    price_at_purchase: item.products!.price,
  }));

  await supabase.from('order_items').insert(orderItemsData);

  // --- 4. Crear Pedido en Conekta ---
  const customerName = profile?.full_name || "Cliente";

  const conektaBody = {
    currency: "MXN",
    customer_info: {
      name: customerName,
      email: user.email,
    },
    line_items: conektaLineItems,
    checkout: {
      type: "HostedPayment",
      allowed_payment_methods: ["card", "cash", "bank_transfer"],
      success_url: `${SITE_URL}/pago/exitoso`,
      failure_url: `${SITE_URL}/pago/fallido`,
      expires_at: Math.floor(Date.now() / 1000) + (60 * 30), 
    },
    metadata: {
      our_order_id: ourOrder.id
    }
  };

  console.log('📦 Enviando a Conekta:', conektaBody);

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
    
    console.log('📨 Respuesta de Conekta - Status:', response.status);
    console.log('📨 Respuesta de Conekta:', conektaOrder);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ Error de autenticación con Conekta - Verifica tu API Key");
        throw new Error("Error de autenticación con el sistema de pagos. Verifica la configuración.");
      }
      
      if (!conektaOrder.id) {
        console.error("❌ Error Conekta:", conektaOrder);
        throw new Error(conektaOrder.details?.[0]?.message || "Error al crear orden en Conekta");
      }
    }

    // --- 5. Actualizar y Devolver URL ---
    await supabase
      .from('orders')
      .update({ conekta_order_id: conektaOrder.id })
      .eq('id', ourOrder.id);
      
    // Vaciar el carrito
    await supabase.from('cart_items').delete().eq('cart_id', typedCartData.id);

    // Revalidar para actualizar el ícono del carrito
    revalidatePath('/');
    
    console.log('✅ Orden creada exitosamente, URL:', conektaOrder.checkout?.url);
    
    return {
      success: true,
      message: "Orden creada.",
      url: conektaOrder.checkout?.url,
    };

  } catch (error: any) {
    console.error('❌ Error en createOrderAndPay:', error);
    
    try {
      await supabase.from('orders').delete().eq('id', ourOrder.id);
    } catch (deleteError) {
      console.error("Error al borrar orden fallida:", deleteError);
    }
    
    return { success: false, message: `Error: ${error.message}` };
  }
}