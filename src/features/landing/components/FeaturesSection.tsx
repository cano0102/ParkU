import { theme } from "@/styles/theme";
import { features } from "../lib/content";
import { Reveal } from "./Reveal";

const COLORS = theme;

/** Sección "beneficios": grid de tarjetas con las capacidades destacadas del sistema. */
export function FeaturesSection() {
  return (
    <section id="beneficios" style={{ padding: "6rem 0", background: "#fff" }}>
      <div className="container">
        <Reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ color: COLORS.primary, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>
            BENEFICIOS
          </div>

          <h2
            style={{
              fontSize: "clamp(2.5rem,5vw,4rem)",
              fontWeight: 900,
              color: COLORS.text,
              marginBottom: "1rem",
            }}
          >
            Tecnología para el SENA
          </h2>

          <p style={{ color: COLORS.textLight, maxWidth: 700, margin: "auto", lineHeight: 1.8 }}>
            Una solución moderna enfocada en seguridad,
            automatización y administración vehicular.
          </p>
        </Reveal>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} className="card" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 20,
                    background: "#E8F5E1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Icon size={34} color={COLORS.primary} />
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: ".8rem", color: COLORS.text }}>
                  {feature.title}
                </h3>

                <p style={{ color: COLORS.textLight, lineHeight: 1.8 }}>{feature.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
