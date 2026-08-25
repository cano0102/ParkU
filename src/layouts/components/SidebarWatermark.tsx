import logoSena from "@/assets/images/logoSena.png";

/** Resplandor decorativo + marca de agua institucional detrás del contenido del sidebar. */
export function SidebarWatermark() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.05)", top: -80, right: -90 }} />
      <img
        src={logoSena}
        alt=""
        style={{
          position: "absolute", left: "50%", bottom: -46,
          width: 240, transform: "translateX(-50%)",
          filter: "brightness(0) invert(1)", opacity: 0.05,
        }}
      />
    </div>
  );
}
