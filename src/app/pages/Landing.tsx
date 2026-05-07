import { useState, useEffect } from "react";

type SlotStatus = "libre" | "ocupado" | "reservado" | "discap";

type Slot = { id: string; status: SlotStatus };

const SENA_GREEN = "#009e3d";
const SENA_DARK = "#007a30";

const slots: Slot[] = [
  { id: "A01", status: "ocupado" }, { id: "A02", status: "ocupado" }, { id: "A03", status: "libre" },
  { id: "A04", status: "libre" }, { id: "A05", status: "ocupado" },
  { id: "B01", status: "libre" }, { id: "B02", status: "reservado" }, { id: "B03", status: "ocupado" },
  { id: "B04", status: "libre" }, { id: "B05", status: "libre" },
  { id: "C01", status: "ocupado" }, { id: "C02", status: "libre" }, { id: "C03", status: "libre" },
  { id: "C04", status: "ocupado" }, { id: "C05", status: "reservado" },
  { id: "D01", status: "libre" }, { id: "D02", status: "ocupado" }, { id: "D03", status: "discap" },
  { id: "D04", status: "libre" }, { id: "D05", status: "ocupado" },
];

const slotColors = {
  libre:    { bg: "rgba(0,158,61,0.15)",  border: "rgba(0,158,61,0.5)",   color: "#4ddb8a" },
  ocupado:  { bg: "rgba(200,40,40,0.15)", border: "rgba(200,40,40,0.4)",  color: "#ff6b6b" },
  reservado:{ bg: "rgba(255,170,0,0.12)", border: "rgba(255,170,0,0.4)",  color: "#ffaa00" },
  discap:   { bg: "rgba(0,120,255,0.15)", border: "rgba(0,120,255,0.4)",  color: "#5ba8ff" },
};

const movements = [
  { plate: "ABC 123", location: "Celda A03", type: "ENTRADA" },
  { plate: "XYZ 456", location: "Celda B04", type: "SALIDA" },
  { plate: "MNO 789", location: "Celda D03", type: "ENTRADA" },
  { plate: "PQR 321", location: "Celda A02", type: "SALIDA" },
  { plate: "STU 654", location: "Moto Z01",  type: "ENTRADA" },
];

const benefits = [
  { icon: "🔐", title: "Control de Acceso Total", desc: "Gestiona quién entra y sale del parqueadero con validación automática de placas y carnés institucionales.", tag: "Seguridad" },
  { icon: "⚡", title: "Gestión en Tiempo Real",  desc: "Monitorea la disponibilidad, ocupación y movimientos del parqueadero al instante, desde cualquier dispositivo.", tag: "Eficiencia" },
  { icon: "📅", title: "Reservas Anticipadas",    desc: "Permite a instructores y aprendices reservar su celda con anticipación y evitar filas en la entrada.", tag: "Comodidad" },
  { icon: "📈", title: "Reportes y Estadísticas", desc: "Genera informes detallados de uso, picos de ocupación y tendencias para tomar mejores decisiones.", tag: "Análisis" },
  { icon: "♿", title: "Celdas Priorizadas",       desc: "Gestión automática de celdas de discapacidad, motocicletas y vehículos especiales con asignación inteligente.", tag: "Inclusión" },
  { icon: "🚨", title: "Gestión de Incidentes",   desc: "Registro y seguimiento de incidentes vehiculares con notificaciones inmediatas al personal de seguridad.", tag: "Respuesta" },
];

const features = [
  { num: "01", name: "Control de Entrada y Salida",      desc: "Registro automático con cámara, lector QR o carné SENA para agilizar el flujo vehicular." },
  { num: "02", name: "Asignación Inteligente de Celdas", desc: "El sistema asigna automáticamente la celda disponible más cercana según el perfil del usuario." },
  { num: "03", name: "Panel Administrativo Completo",     desc: "Vista centralizada del parqueadero, historial de movimientos y herramientas de configuración avanzada." },
  { num: "04", name: "Reconocimiento de Placas (LPR)",   desc: "Identificación automática de vehículos registrados para acceso sin fricciones." },
  { num: "05", name: "Notificaciones y Alertas",          desc: "Alertas en tiempo real para vehículos no autorizados, reservas vencidas e incidentes." },
];

const roles = [
  {
    icon: "👔", name: "Administrador",
    desc: "Control total de la plataforma. Configura el sistema, gestiona usuarios y genera reportes institucionales.",
    perms: ["Gestión completa de celdas", "Administración de usuarios", "Reportes avanzados", "Configuración del sistema", "Gestión de incidentes"],
  },
  {
    icon: "🎓", name: "Instructor",
    desc: "Acceso prioritario con gestión de reservas y visualización del estado actual del parqueadero en tiempo real.",
    perms: ["Reserva anticipada de celdas", "Vista del mapa en tiempo real", "Historial personal", "Acceso prioritario garantizado"],
  },
  {
    icon: "🎒", name: "Aprendiz",
    desc: "Consulta disponibilidad, realiza reservas y recibe notificaciones sobre el estado de su celda asignada.",
    perms: ["Consulta de disponibilidad", "Reserva de celda", "Notificaciones push", "QR de acceso personal"],
  },
];

const stripItems = ["🛡️ Acceso Seguro y Controlado", "📊 Reportes en Tiempo Real", "📱 Interfaz Intuitiva", "🚗 Reconocimiento de Placas"];

function useAnimated() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);
  return visible;
}

export default function SenaLanding() {
  const visible = useAnimated();
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  const libre   = slots.filter(s => s.status === "libre").length;
  const ocupado = slots.filter(s => s.status === "ocupado").length;
  const reservado = slots.filter(s => s.status === "reservado").length;
  const pct = Math.round((ocupado / slots.length) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Barlow', sans-serif; }
        .sena-landing { font-family: 'Barlow', sans-serif; color: #1a1a1a; background: #fff; overflow-x: hidden; }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up.d1 { transition-delay: 0.1s; }
        .fade-up.d2 { transition-delay: 0.25s; }
        .fade-up.d3 { transition-delay: 0.4s; }
        .fade-up.d4 { transition-delay: 0.55s; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse 2s infinite; }
      `}</style>

      <div className="sena-landing">

        {/* ── NAV ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "#0a0a0a", borderBottom: `3px solid ${SENA_GREEN}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2.5rem", height: 64,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 38, height: 38, background: SENA_GREEN, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 15, color: "#fff",
            }}>S</div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: 1 }}>
              <span style={{ color: SENA_GREEN }}>SENA</span> · ParkU
            </span>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            {["Inicio", "Funciones", "Usuarios", "Soporte"].map(l => (
              <a key={l} href="#" style={{ color: "#ccc", fontSize: 14, fontWeight: 500, textDecoration: "none", letterSpacing: 0.5 }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = SENA_GREEN}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "#ccc"}>{l}</a>
            ))}
          </div>
          <button style={{
            background: SENA_GREEN, color: "#fff", border: "none",
            padding: "9px 22px", borderRadius: 4, fontFamily: "'Barlow', sans-serif",
            fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: 0.5,
          }}
            onMouseEnter={e => e.currentTarget.style.background = SENA_DARK}
            onMouseLeave={e => e.currentTarget.style.background = SENA_GREEN}>
            Iniciar Sesión 
          </button>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          minHeight: "100vh", background: "#0a0a0a",
          display: "flex", alignItems: "center", paddingTop: 64, position: "relative", overflow: "hidden",
        }}>
          {/* diagonal background */}
          <div style={{
            position: "absolute", top: 0, right: 0, width: "55%", height: "100%",
            background: "linear-gradient(135deg,#001a0a 0%,#003d1a 50%,#006628 100%)",
            clipPath: "polygon(12% 0%,100% 0%,100% 100%,0% 100%)",
          }} />

          <div style={{
            position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto",
            padding: "4rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "4rem", alignItems: "center", width: "100%",
          }}>

            {/* LEFT */}
            <div>
              <div className={`fade-up ${visible ? "visible" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,158,61,0.15)", border: "1px solid rgba(0,158,61,0.4)", borderRadius: 2, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#4ddb8a", letterSpacing: 2, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, background: "#4ddb8a", borderRadius: "50%", display: "inline-block" }} />
                Sistema activo
              </div>

              <h1 className={`fade-up d1 ${visible ? "visible" : ""}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 72, lineHeight: 0.95, color: "#fff", textTransform: "uppercase", letterSpacing: -1, marginBottom: "1.5rem" }}>
                Control de<br />
                <span style={{ color: SENA_GREEN }}>Parqueadero</span><br />
                SENA
              </h1>

              <p className={`fade-up d2 ${visible ? "visible" : ""}`}
                style={{ fontSize: 17, color: "#aaa", lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: 480 }}>
                Plataforma institucional para la gestión inteligente del acceso vehicular. Diseñada para aprendices, instructores y administradores del Servicio Nacional de Aprendizaje.
              </p>

              <div className={`fade-up d3 ${visible ? "visible" : ""}`} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button style={{ background: SENA_GREEN, color: "#fff", padding: "14px 32px", borderRadius: 4, border: "none", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = SENA_DARK; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = SENA_GREEN; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Acceder al Sistema
                </button>
              </div>

              <div className={`fade-up d4 ${visible ? "visible" : ""}`} style={{ display: "flex", gap: "2rem", marginTop: "3rem" }}>
                {[["200+", "Celdas gestionadas"], ["24/7", "Monitoreo continuo"], ["3", "Roles de usuario"]].map(([num, label]) => (
                  <div key={label} style={{ borderLeft: `3px solid ${SENA_GREEN}`, paddingLeft: "1rem" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: "#fff", lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: 12, color: "#777", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – parking map */}
            <div className={`fade-up d2 ${visible ? "visible" : ""}`}>
              <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,158,61,0.3)", borderRadius: 8, padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>Mapa en Tiempo Real</span>
                  <span style={{ fontSize: 12, color: "#4ddb8a", fontWeight: 600 }}>● En línea</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                  {slots.map(s => {
                    const c = slotColors[s.status];
                    return (
                      <div key={s.id} style={{
                        aspectRatio: "1.6", borderRadius: 4, border: `1px solid ${c.border}`,
                        background: c.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 0.5, cursor: "default",
                        transition: "transform 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >{s.id}</div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  {[["#4ddb8a","Libre"],["#ff6b6b","Ocupado"],["#ffaa00","Reservado"],["#5ba8ff","Discapacidad"]].map(([col, lbl]) => (
                    <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#aaa" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
                      {lbl}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                  {([
                    [libre, "#4ddb8a", "Libres"],
                    [ocupado, "#ff6b6b", "Ocupados"],
                    [reservado, "#ffaa00", "Reservados"],
                    [pct + "%", "#aaa", "Ocupación"],
                  ] as [string | number, string, string][]).map(([n, col, lbl]) => (
                    <div key={lbl} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: col }}>{n}</div>
                      <div style={{ fontSize: 11, color: "#777" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STRIP ── */}
        <div style={{ background: SENA_GREEN, padding: "1.25rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
          {stripItems.map(item => (
            <div key={item} style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{item}</div>
          ))}
        </div>

        {/* ── BENEFITS ── */}
        <section style={{ padding: "5rem 2.5rem", background: "#f4f4f4" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SENA_GREEN, letterSpacing: 3, textTransform: "uppercase", marginBottom: "0.75rem" }}>¿Por qué elegir ParkU?</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, textTransform: "uppercase", marginBottom: "1rem" }}>Beneficios para<br />tu institución</h2>
            <p style={{ fontSize: 17, color: "#555", maxWidth: 580, lineHeight: 1.65, marginBottom: "3rem" }}>Optimiza el flujo vehicular y la seguridad del campus con una solución pensada para el SENA.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5px", background: "#ddd", border: "1.5px solid #ddd" }}>
              {benefits.map((b, i) => (
                <div key={b.title}
                  style={{ background: hoveredBenefit === i ? "#fafff7" : "#fff", padding: "2.5rem 2rem", transition: "background 0.2s", cursor: "default" }}
                  onMouseEnter={() => setHoveredBenefit(i)}
                  onMouseLeave={() => setHoveredBenefit(null)}>
                  <div style={{ fontSize: 24, marginBottom: "1.25rem", width: 52, height: 52, borderRadius: 6, background: "#e6f7ee", display: "flex", alignItems: "center", justifyContent: "center" }}>{b.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: "0.5rem" }}>{b.title}</div>
                  <div style={{ fontSize: 15, color: "#555", lineHeight: 1.6 }}>{b.desc}</div>
                  <div style={{ display: "inline-block", marginTop: "1rem", fontSize: 11, fontWeight: 700, color: SENA_GREEN, letterSpacing: 1.5, textTransform: "uppercase", borderBottom: `2px solid ${SENA_GREEN}`, paddingBottom: 2 }}>{b.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: "5rem 2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SENA_GREEN, letterSpacing: 3, textTransform: "uppercase", marginBottom: "0.75rem" }}>Funcionalidades del Sistema</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, textTransform: "uppercase", marginBottom: "3rem" }}>Todo lo que<br />necesitas</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
              {/* list */}
              <div>
                {features.map((f, i) => (
                  <div key={f.num}
                    style={{ display: "flex", gap: "1rem", padding: "1.25rem 0", borderBottom: "1px solid #eee", borderTop: i === 0 ? "1px solid #eee" : "none", cursor: "default", paddingLeft: hoveredFeature === i ? 8 : 0, transition: "padding-left 0.2s" }}
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: SENA_GREEN, minWidth: 40, lineHeight: 1, opacity: 0.5 }}>{f.num}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                      <div style={{ fontSize: 14, color: "#555" }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* dashboard preview */}
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[["142","#4ddb8a","Vehículos hoy",71],[" 23","#ffaa00","Reservas activas",45]].map(([num,col,lbl,pct]) => (
                    <div key={lbl} style={{ flex: 1, borderRadius: 6, padding: "1rem", background: col === "#4ddb8a" ? "rgba(0,158,61,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${col === "#4ddb8a" ? "rgba(0,158,61,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: SENA_GREEN }}>{num}</div>
                      <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{lbl}</div>
                      <div style={{ height: 6, borderRadius: 3, marginTop: "1rem", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: col, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "1rem" }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>Últimos movimientos</div>
                  {movements.map(m => (
                    <div key={m.plate} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12, color: "#aaa" }}>
                      <span>{m.plate} · {m.location}</span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700,
                        background: m.type === "ENTRADA" ? "rgba(0,158,61,0.2)" : "rgba(200,40,40,0.2)",
                        color: m.type === "ENTRADA" ? "#4ddb8a" : "#ff6b6b",
                      }}>{m.type}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  {[["98%","#5ba8ff","Sistema en línea"],["3s","#4ddb8a","Tiempo acceso"]].map(([num,col,lbl]) => (
                    <div key={lbl} style={{ flex: 1, borderRadius: 6, padding: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, color: col }}>{num}</div>
                      <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ROLES ── */}
        <section style={{ padding: "5rem 2.5rem", background: "#0a0a0a" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ddb8a", letterSpacing: 3, textTransform: "uppercase", marginBottom: "0.75rem" }}>Diseñado para todos</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, textTransform: "uppercase", color: "#fff", marginBottom: "1rem" }}>Perfiles de usuario<br />del sistema</h2>
            <p style={{ fontSize: 17, color: "#777", maxWidth: 580, lineHeight: 1.65, marginBottom: "3rem" }}>Cada rol tiene acceso a las herramientas que necesita, sin complejidad innecesaria.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.06)" }}>
              {roles.map((r, i) => (
                <div key={r.name}
                  style={{ background: hoveredRole === i ? "#0d0d0d" : "#0a0a0a", padding: "2.5rem 2rem", borderTop: `3px solid ${hoveredRole === i ? SENA_GREEN : "transparent"}`, transition: "all 0.2s", cursor: "default" }}
                  onMouseEnter={() => setHoveredRole(i)}
                  onMouseLeave={() => setHoveredRole(null)}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>{r.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: "#fff", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: 0.5 }}>{r.name}</div>
                  <div style={{ fontSize: 14, color: "#666", lineHeight: 1.65 }}>{r.desc}</div>
                  <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.perms.map(p => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#888" }}>
                        <span style={{ width: 5, height: 5, background: SENA_GREEN, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: SENA_GREEN, padding: "5rem 2.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-2rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 200, color: "rgba(255,255,255,0.07)", letterSpacing: -5, pointerEvents: "none", lineHeight: 1 }}>SENA</div>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "center", position: "relative" }}>
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 52, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: "1rem" }}>¿Listo para empezar<br />a gestionar?</h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>Inicia sesión con tus credenciales institucionales SENA y accede al sistema de parqueadero de tu regional.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button style={{ background: "#fff", color: SENA_GREEN, padding: "16px 36px", borderRadius: 4, border: "none", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0fff5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}>
                Iniciar Sesión en el Sistema
              </button>
              <button style={{ background: "transparent", color: "#fff", padding: "16px 36px", borderRadius: 4, border: "2px solid rgba(255,255,255,0.5)", fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"}>
                Contactar Soporte
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#050505", borderTop: "1px solid #111", padding: "2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#555" }}>© 2025 SENA — Servicio Nacional de Aprendizaje · Sistema de Gestión de Parqueadero</div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacidad", "Términos", "Soporte TIC"].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = SENA_GREEN}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = "#555"}>{l}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
