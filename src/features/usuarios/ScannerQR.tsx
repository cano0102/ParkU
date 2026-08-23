import { memo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

interface ScannerQRProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export const ScannerQR = memo(({ onScanSuccess, onClose }: ScannerQRProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (!result || result.length === 0) return;

    try {
      // El resultado es un array con el texto del QR en rawValue
      const raw = result[0]?.rawValue;
      if (!raw) {
        setError("No se pudo leer el código QR");
        toast.error("No se pudo leer el código QR");
        return;
      }
      const parsed = JSON.parse(raw);
      onScanSuccess(parsed);
      onClose();
    } catch (e) {
      console.error("Error parseando QR:", e);
      setError("El código QR no contiene datos válidos.");
      toast.error("QR inválido, intenta de nuevo");
    }
  };

  const handleError = (err: any) => {
    console.error("Error de cámara:", err);
    setError("No se pudo acceder a la cámara. Verifica los permisos.");
    toast.error("No se pudo acceder a la cámara");
  };

  return (
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
        <p style={{ color: "#EF4444", fontSize: 12, marginTop: 8, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
});

ScannerQR.displayName = "ScannerQR";
