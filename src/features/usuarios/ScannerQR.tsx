import { memo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { theme } from "@/theme";
import { CameraScanner } from "@/components/scanner";
import { decodeQrPayload, type QrCedulaPayload } from "@/services/api/qr";

const COLORS = theme;

interface ScannerQRProps {
  open: boolean;
  onScanSuccess: (data: QrCedulaPayload) => void;
  onClose: () => void;
}

export const ScannerQR = memo(({ open, onScanSuccess, onClose }: ScannerQRProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (!result || result.length === 0) return;

    // El resultado es un array con el texto del QR en rawValue
    const raw = result[0]?.rawValue;
    if (!raw) {
      setError("No se pudo leer el código QR");
      toast.error("No se pudo leer el código QR");
      return;
    }
    const parsed = decodeQrPayload(raw);
    if (!parsed) {
      setError("El código QR no contiene datos válidos.");
      toast.error("QR inválido, intenta de nuevo");
      return;
    }
    onScanSuccess(parsed);
    onClose();
  };

  const handleError = (err: any) => {
    console.error("Error de cámara:", err);
    setError("No se pudo acceder a la cámara. Verifica los permisos.");
    toast.error("No se pudo acceder a la cámara");
  };

  return (
    <CameraScanner
      open={open}
      onClose={onClose}
      icon={<QrCode size={18} color={COLORS.primary} />}
      eyebrow="Lectura de cédula"
      title="Escanear QR"
      maxWidth={450}
    >
      <div style={{ padding: "1.5rem" }}>
        <div style={{ position: "relative", maxWidth: 400, margin: "0 auto" }}>
          <Scanner
            constraints={{ facingMode: "environment" }}
            onScan={handleScan}
            onError={handleError}
            styles={{
              container: { borderRadius: 16, overflow: "hidden" },
              video: { width: "100%", height: "auto" },
            }}
          />
          {error && (
            <p style={{ color: "#EF4444", fontSize: 12, marginTop: 8, textAlign: "center" }}>{error}</p>
          )}
        </div>
        <p style={{ fontSize: 11, color: COLORS.textLight, marginTop: 16, textAlign: "center" }}>
          Coloca el código QR de la cédula frente a la cámara.
        </p>
      </div>
    </CameraScanner>
  );
});

ScannerQR.displayName = "ScannerQR";
