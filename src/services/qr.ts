/**
 * Decodificación del payload JSON que trae el QR de una cédula colombiana.
 * Extraído de Usuarios/ScannerQR.tsx (antes el `JSON.parse` vivía inline en el
 * componente, sin tipo — `data: any`). La captura de cámara y el estado del
 * modal se quedan en el componente; esto es la única parte no-UI.
 */
export interface QrCedulaPayload {
  numeroDocumento?: string;
  identificacion?: string;
  documento?: string;
  nombreCompleto?: string;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  correo?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  numero?: string;
  tipoDocumento?: string;
}

/** Devuelve el payload decodificado, o `null` si `raw` no es JSON válido. */
export function decodeQrPayload(raw: string): QrCedulaPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as QrCedulaPayload;
  } catch {
    return null;
  }
}
