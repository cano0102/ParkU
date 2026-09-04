import { IconMenu2 as Menu, IconX as X } from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import { navLinks } from "../lib/content";

const COLORS = theme;

interface LandingNavbarProps {
  scrolled: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onScrollTo: (id: string) => void;
  onLogin: () => void;
}

/** Navbar fija con logo, enlaces de anclaje, botón de ingreso y menú móvil. */
export function LandingNavbar({ scrolled, menuOpen, onToggleMenu, onScrollTo, onLogin }: LandingNavbarProps) {
  return (
    <nav
      className="navbar"
      style={{
        width: "100%",
        position: "fixed",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
        boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,.06)" : "none",
      }}
    >
      <div
        className="container"
        style={{
          height: 85,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => onScrollTo("inicio")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
          }}
        >
          <img src={logoSena} alt="SENA" style={{ width: 58 }} />

          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.text }}>
              ParkU
            </div>

            <div
              className="logo-subtitle"
              style={{
                color: COLORS.textLight,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Sistema Institucional SENA
            </div>
          </div>
        </div>

        {/* NAV LINKS */}
        <div
          className="nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          {navLinks.map((link) => (
            <button key={link.id} className="nav-link" onClick={() => onScrollTo(link.id)}>
              {link.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onLogin}
            style={{
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              padding: "14px 26px",
              borderRadius: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(57,169,0,.2)",
            }}
          >
            Ingresar
          </button>

          <button
            className="menu-toggle"
            onClick={onToggleMenu}
            aria-label="Abrir menú"
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            background: "#fff",
            padding: "1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onScrollTo(link.id)}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                fontWeight: 700,
                fontSize: 16,
                color: COLORS.text,
                cursor: "pointer",
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
