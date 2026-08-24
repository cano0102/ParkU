import React, { memo } from "react";
import { X } from "lucide-react";
import { theme } from "@/theme";

const C = theme;

export const ModalHeader = memo(({ icon, eyebrow, title, onClose }: { icon?: React.ReactNode; eyebrow?: string; title: string; onClose: () => void }) => (
  <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {icon && <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>}
      <div>
        {eyebrow && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1, margin: 0 }}>{title}</h2>
      </div>
    </div>
    <button onClick={onClose} aria-label="Cerrar"
      style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <X size={16} />
    </button>
  </div>
));
ModalHeader.displayName = "ModalHeader";
