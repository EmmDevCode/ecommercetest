import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con permisos de 'service_role' (ADMIN)
// Úsalo SÓLO en el backend (Route Handlers, Server Actions)
// NUNCA en el frontend.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    // Estas opciones son necesarias para un cliente de servicio
    autoRefreshToken: false,
    persistSession: false
  }
});