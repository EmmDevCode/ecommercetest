import Link from 'next/link';
import styles from '../pago.module.css'; // Crearemos este estilo

export default function PagoExitosoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.icon}>✅</div>
      <h1>¡Pago Exitoso!</h1>
      <p>Gracias por tu compra. Hemos recibido tu pago y estamos procesando tu pedido.</p>
      <Link href="/" className={styles.button}>
        Volver al Inicio
      </Link>
    </div>
  );
}