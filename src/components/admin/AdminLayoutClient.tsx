// src/components/admin/AdminLayoutClient.tsx
"use client";

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import styles from './AdminLayoutClient.module.css';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado para controlar si el sidebar está colapsado o expandido
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={styles.container}>
      {/* Pasamos el estado y la función para cerrar al Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* El contenido principal se ajusta dinámicamente */}
      <div 
        className={styles.mainWrapper}
        style={{ marginLeft: isSidebarOpen ? '260px' : '80px' }} // 80px es el ancho colapsado
      >
        <AdminHeader 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}