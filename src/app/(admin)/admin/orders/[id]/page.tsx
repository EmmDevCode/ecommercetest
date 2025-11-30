import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js"; 
import { ArrowLeft, MapPin, Mail, Phone, CreditCard, Package, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StatusSelector } from "@/components/admin/StatusSelector";
import styles from "./order-detail.module.css";

async function getOrderData(orderId: string) {
  const supabase = await createServerClient();

  // 1. Obtener el Pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_purchase,
        skus (
          id,
          products ( name, images )
        )
      )
    `)
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Error al cargar pedido:", orderError);
    return null;
  }

  // 2. ESTRATEGIA BLINDADA: Obtener datos del Cliente
  let customerInfo = {
    full_name: "Cliente",
    email: "",
    phone: "",
    id: order.user_id
  };
  
  if (order.user_id) {
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;

      if (serviceKey) {
        // Creamos cliente Admin
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey, 
          { auth: { persistSession: false } }
        );

        // INTENTO A: Buscar en la tabla 'profiles' (Tu tabla personalizada)
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", order.user_id)
          .single();

        // INTENTO B: Buscar en el sistema de Auth (Fuente de verdad)
        // Esto recupera el email real y metadata del login
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(order.user_id);

        // COMBINAR DATOS (Prioridad: Perfil > Auth Metadata > Auth Email)
        if (authUser) {
          customerInfo.email = authUser.email || "";
          customerInfo.phone = authUser.phone || "";
          // A veces el nombre está en la metadata del usuario de Auth
          const metaName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
          customerInfo.full_name = metaName || "Usuario";
        }

        if (profileData) {
          // Si existe perfil y tiene datos, sobreescribimos
          if (profileData.full_name) customerInfo.full_name = profileData.full_name;
          if (profileData.email) customerInfo.email = profileData.email;
          if (profileData.phone) customerInfo.phone = profileData.phone;
        }
      }
    } catch (err) {
      console.error("Error recuperando usuario admin:", err);
    }
  }

  return { order, customer: customerInfo };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOrderData(id);

  if (!data || !data.order) {
    return (
      <div className={styles.errorContainer}>
        <h1>Pedido no encontrado</h1>
        <Link href="/admin/orders" className={styles.backButton}>
          <ArrowLeft size={18} /> Volver a la lista
        </Link>
      </div>
    );
  }

  const { order, customer } = data;

  // Helpers visuales
  const displayName = customer.full_name !== "Usuario" ? customer.full_name : (customer.email || "Usuario sin nombre");
  const userIdShort = order.user_id.slice(0, 8);

  // Parsear dirección
  let address: any = {};
  try {
    address = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address || {};
  } catch (e) {
    address = {};
  }

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN'
  }).format(order.total_amount);

  const formattedDate = new Date(order.created_at).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/orders" className={styles.backButton}>
            <ArrowLeft size={18} /> Volver
          </Link>
          <h1 className={styles.title}>Pedido #{userIdShort}...</h1>
          <span className={styles.date}>{formattedDate}</span>
        </div>
        
        <div className={styles.statusWrapper}>
          <span className={styles.statusLabel}>Estado:</span>
          <StatusSelector orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className={styles.grid}>
        {/* Productos */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Artículos ({order.order_items.length})</h2>
            
            <div className={styles.itemsList}>
              {order.order_items.map((item: any) => {
                const product = item.skus?.products;
                const imageUrl = product?.images?.[0]?.url || '/placeholder-image.png';
                const productName = product?.name || 'Producto eliminado';
                
                return (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={imageUrl} 
                        alt={productName} 
                        width={60} 
                        height={60} 
                        className={styles.img} 
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{productName}</span>
                      <span className={styles.itemSku}>SKU: {item.skus?.id.slice(0,8)}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemPrice}>
                        ${item.price_at_purchase} x {item.quantity}
                      </span>
                      <span className={styles.itemTotal}>
                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.totalsSection}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formattedTotal}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Envío</span>
                <span>$0.00</span>
              </div>
              <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                <span>Total Pagado</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles Lateral */}
        <div className={styles.sidebar}>
          
          {/* Cliente (DATOS REALES) */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Cliente</h2>
            <div className={styles.infoGroup}>
              <div className={styles.infoRow}>
                <div className={styles.avatar}>
                  <User size={20} />
                </div>
                <div>
                  <p className={styles.infoName}>{displayName}</p>
                  <p className={styles.infoSub}>ID: {userIdShort}</p>
                </div>
              </div>
              
              <div className={styles.contactRow}>
                <Mail size={16} className={styles.icon} />
                <span className={styles.textSmall}>{customer.email || 'No disponible'}</span>
              </div>
              
              {customer.phone && (
                <div className={styles.contactRow}>
                  <Phone size={16} className={styles.icon} />
                  <span className={styles.textSmall}>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Dirección de Envío</h2>
            <div className={styles.addressBox}>
              <MapPin size={18} className={styles.addressIcon} />
              <div className={styles.addressText}>
                {address?.street ? (
                  <>
                    <p>{address.street} {address.exterior_num} {address.interior_num}</p>
                    <p>{address.colony}</p>
                    <p>{address.city}, {address.state}</p>
                    <p>CP: {address.postal_code}</p>
                  </>
                ) : (
                  <p>Dirección no registrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Pago */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Pago</h2>
            <div className={styles.paymentInfo}>
              <div className={styles.contactRow}>
                <CreditCard size={16} className={styles.icon} />
                <span>Conekta</span>
              </div>
              <div className={styles.contactRow}>
                <Package size={16} className={styles.icon} />
                <span className={styles.idRef}>{order.conekta_order_id || 'Procesando'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}