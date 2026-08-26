import { Loader2 } from "lucide-react";
import { theme } from "@/styles/theme";

const C = theme;

interface LoadingStateProps {
  /** Texto bajo el spinner. Por defecto "Cargando...". */
  message?: string;
}

/**
 * Reemplaza el hueco entre "petición en curso" y "sin resultados": sin esto, toda pantalla
 * de datos pasaba directo a su estado vacío ("No se encontraron X") mientras la petición real
 * seguía en curso, dando a entender que no hay datos cuando en realidad solo faltan por llegar.
 */
export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
  return (
    <div
      role="status"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "3rem 1rem", borderRadius: 16, border: `1px solid ${C.border}`,
        background: "#fff", color: C.textLight, gap: 10,
      }}
    >
      <style>{`
        @keyframes shared-loading-spin { to { transform: rotate(360deg); } }
        .shared-loading-spinner { animation: shared-loading-spin .8s linear infinite; }
      `}</style>
      <Loader2 className="shared-loading-spinner" size={28} color={C.primary} />
      <p style={{ fontWeight: 700, fontSize: 13 }}>{message}</p>
    </div>
  );
}
