import styles from './TrackingBar.module.css';

// Define todos los pasos del proceso de envío
const steps = [
  { 
    key: 'paid', 
    label: 'Pagado', 
    subtitle: 'Pago confirmado',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    key: 'processing', 
    label: 'Procesando', 
    subtitle: 'Preparando pedido',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  },
  { 
    key: 'shipped', 
    label: 'Enviado', 
    subtitle: 'Empacado y enviado',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )
  },
  { 
    key: 'in_transit', 
    label: 'En Tránsito', 
    subtitle: 'En camino al centro',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  { 
    key: 'out_for_delivery', 
    label: 'En Reparto', 
    subtitle: 'Próximo a entregar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  { 
    key: 'delivered', 
    label: 'Entregado', 
    subtitle: 'Pedido recibido',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

interface TrackingBarProps {
  currentStatus: string;
}

export const TrackingBar = ({ currentStatus }: TrackingBarProps) => {
  // Encuentra el índice del estado actual
  const currentIndex = steps.findIndex(step => step.key === currentStatus);

  // Estados especiales
  if (currentStatus === 'cancelled') {
    return (
      <div className={styles.cancelledStatus}>
        <div className={styles.cancelledIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className={styles.cancelledTitle}>Pedido Cancelado</h3>
        <p className={styles.cancelledSubtitle}>
          Este pedido ha sido cancelado. Contacta al servicio al cliente si necesitas ayuda.
        </p>
      </div>
    );
  }

  if (currentStatus === 'pending') {
    return (
      <div className={styles.pendingStatus}>
        <div className={styles.pendingIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={styles.pendingTitle}>Pendiente de Pago</h3>
        <p className={styles.pendingSubtitle}>
          Tu pedido está esperando la confirmación del pago.
        </p>
      </div>
    );
  }

  // Si no es un estado válido para el tracking
  if (currentIndex === -1) {
    return null;
  }

  return (
    <div className={styles.trackingBar}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stepClass = `${styles.step} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`;

        return (
          <div key={step.key} className={stepClass}>
            <div className={styles.stepContent}>
              <div className={styles.stepIcon}>
                {step.icon}
              </div>
              <div className={styles.stepLabel}>
                {step.label}
              </div>
              <div className={styles.stepSubtitle}>
                {step.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};