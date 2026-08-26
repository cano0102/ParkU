import { theme } from "@/styles/theme";
import { steps } from "../lib/content";
import { Reveal } from "./Reveal";

const COLORS = theme;

/** Sección "cómo funciona": los tres pasos para empezar a usar ParkU. */
export function HowItWorksSection() {
  return (
    <section id="como-funciona" style={{ padding: "6rem 0", background: COLORS.background }}>
      <div className="container">
        <Reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ color: COLORS.primary, fontWeight: 800, letterSpacing: 1, marginBottom: 14 }}>
            PROCESO
          </div>

          <h2
            style={{
              fontSize: "clamp(2.5rem,5vw,4rem)",
              fontWeight: 900,
              color: COLORS.text,
              marginBottom: "1rem",
            }}
          >
            Cómo Funciona
          </h2>

          <p style={{ color: COLORS.textLight, maxWidth: 700, margin: "auto", lineHeight: 1.8 }}>
            Empieza a usar ParkU en dos simples pasos.
          </p>
        </Reveal>

        <div
          className="steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "2rem",
            position: "relative",
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <Reveal
                key={step.title}
                style={{ position: "relative", textAlign: "center", transitionDelay: `${i * 0.12}s` }}
              >
                {i < steps.length - 1 && <div className="step-line" />}

                <div
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: "#fff",
                    border: `2px solid ${COLORS.primary}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 15px 30px rgba(57,169,0,.12)",
                  }}
                >
                  <Icon size={36} color={COLORS.primary} />

                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: COLORS.primary,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: ".6rem", color: COLORS.text }}>
                  {step.title}
                </h3>

                <p style={{ color: COLORS.textLight, lineHeight: 1.8, maxWidth: 320, margin: "auto" }}>
                  {step.desc}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
