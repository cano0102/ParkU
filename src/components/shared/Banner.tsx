import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { theme } from "@/theme";

const C = theme;

export const Banner = memo(({ tone, message }: { tone: "danger" | "info" | "success"; message: string }) => {
  const s = tone === "danger" ? { bg: C.dangerBg, border: C.dangerBorder, text: C.danger }
    : tone === "info" ? { bg: C.infoBg, border: "#BFDBFE", text: C.info }
    : { bg: C.primaryPale, border: C.primaryLight, text: C.primaryDark };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 11, border: `1px solid ${s.border}`, background: s.bg, color: s.text }}>
      <AlertCircle size={13} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>{message}</span>
    </div>
  );
});
Banner.displayName = "Banner";
