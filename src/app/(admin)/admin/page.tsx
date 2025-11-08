// src/app/(admin)/admin/page.tsx
import styles from './admin.module.css';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido al panel de administrador.</p>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>Pedidos Pendientes</h2>
          <span className={styles.statValue}>0</span> 
          {/* TODO: Cargar datos reales */}
        </div>
        <div className={styles.statCard}>
          <h2>Ingresos del Mes</h2>
          <span className={styles.statValue}>0</span>
        </div>
      </div>
    </div>
  );
}