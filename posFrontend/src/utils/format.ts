/** Formatea un número como moneda MXN */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style:   'currency',
    currency: 'MXN',
  }).format(amount);
}

/** Formatea una fecha ISO a formato legible en español */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  }).format(new Date(isoString));
}

/** Formatea una fecha ISO a fecha y hora */
export function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

/** Devuelve la fecha de hoy en formato YYYY-MM-DD (para inputs date) */
export function todayISO(): string {
  return new Date().toISOString().substring(0, 10);
}

/** Genera un ID corto legible para depuración */
export function shortId(id: string): string {
  return id.substring(id.length - 6).toUpperCase();
}

/** Etiqueta del método de pago */
export function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    efectivo:      'Efectivo',
    tarjeta:       'Tarjeta',
    transferencia: 'Transferencia',
  };
  return map[method] ?? method;
}
