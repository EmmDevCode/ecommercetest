// Para usar en el LADO DEL CLIENTE (Componentes de Cliente)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Crea un cliente de Supabase para el navegador
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}