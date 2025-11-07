import Link from 'next/link';
import styles from '../pago.module.css'; // Reutilizamos el mismo estilo

export default function PagoFallidoPage() {
  return (
    <div className={styles.page}>
      <div className={`${styles.icon} ${styles.fail}`}>❌</div>
      <h1>Pago Fallido</h1>
      <p>Hubo un problema al procesar tu pago. No se te ha cobrado nada.</p>
      <Link href="/carrito" className={styles.button}>
        Volver al Carrito
      </Link>
    </div>
  );
}