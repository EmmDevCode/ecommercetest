// src/app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'; // Importa el nuevo cliente
import '@/components/admin/AdminLayoutClient.module.css'; // Asegura que se carguen estilos base si es necesario

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') notFound();

  // Renderizamos el Wrapper Cliente que contiene Sidebar y Header
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}