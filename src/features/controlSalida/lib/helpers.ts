export const PAGE_SIZE = 8;

export function isSameDay(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function formatDateTime(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function getTiempoEstadia(fechaEntrada: string, fechaSalida?: string) {
  const entrada = new Date(fechaEntrada);
  const salida = fechaSalida ? new Date(fechaSalida) : new Date();
  const diffMs = salida.getTime() - entrada.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMin}min`;
  }
  return `${diffMin}min`;
}
