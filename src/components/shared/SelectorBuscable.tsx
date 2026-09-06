import { useMemo, useState } from "react";
import { IconCheck as Check, IconSearch as Search, IconX as X } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { FormField } from "./FormField";

const C = theme;

export interface OpcionBuscable {
  id: string;
  /** Lo que identifica la opción: un nombre, una placa, el número de una celda. */
  titulo: string;
  /** El dato que desempata entre dos parecidos: el correo, la marca del vehículo. */
  subtitulo?: string;
  /** Se muestra pero no se puede elegir; `nota` explica por qué. */
  deshabilitada?: boolean;
  nota?: string;
}

interface SelectorBuscableProps {
  label: string;
  opciones: OpcionBuscable[];
  valor: string;
  onChange: (id: string) => void;
  id?: string;
  placeholder?: string;
  /** Qué decir cuando la búsqueda no encuentra nada. */
  textoVacio?: string;
  /** Si se pasa, se puede dejar sin elegir (y este es el texto del botón para hacerlo). */
  textoSinSeleccion?: string;
  error?: string;
  ayuda?: string;
  deshabilitado?: boolean;
  /** Cuántas opciones se listan de una vez. Las demás aparecen al escribir. */
  maximoVisible?: number;
}

/**
 * Un campo para elegir algo de una lista larga: se escribe para filtrar y se elige de las
 * sugerencias, en vez de desplegar cientos de opciones en un `select`.
 *
 * Es el mismo patrón del buscador de cuentas al vincular un conductor, que era el único sitio
 * donde elegir entre muchos era cómodo. Un `select` nativo obliga a reconocer la opción de
 * memoria: aquí basta con recordar un trozo del nombre, del correo o de la placa.
 *
 * Una vez elegida, la lista se recoge y queda una sola línea con lo elegido — así un
 * formulario con cuatro de estos campos sigue cabiendo en la pantalla.
 */
export function SelectorBuscable({
  label, opciones, valor, onChange, id, placeholder = "Escribe para buscar…",
  textoVacio = "Sin resultados", textoSinSeleccion, error, ayuda, deshabilitado = false,
  maximoVisible = 6,
}: SelectorBuscableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);

  const seleccionada = opciones.find((o) => o.id === valor);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const coinciden = q
      ? opciones.filter((o) => `${o.titulo} ${o.subtitulo ?? ""}`.toLowerCase().includes(q))
      : opciones;
    return coinciden.slice(0, maximoVisible);
  }, [opciones, busqueda, maximoVisible]);

  const elegir = (opcionId: string) => {
    onChange(opcionId);
    setBusqueda("");
    setAbierto(false);
  };

  return (
    <FormField label={label} error={error}>
      {seleccionada && !abierto ? (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10,
            border: `1px solid ${C.primary}55`, background: "rgba(57,169,0,.06)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {seleccionada.titulo}
            </p>
            {seleccionada.subtitulo && (
              <p style={{ fontSize: 10.5, color: C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {seleccionada.subtitulo}
              </p>
            )}
          </div>
          {!deshabilitado && (
            <button
              type="button"
              onClick={() => { setAbierto(true); setBusqueda(""); }}
              aria-label={`Cambiar ${label.toLowerCase()}`}
              style={{
                flexShrink: 0, padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: "#fff", color: C.textLight, fontSize: 11, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cambiar
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color={C.textLight}
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              id={id}
              type="text"
              autoComplete="off"
              // El <label> de FormField no va asociado al control (no lleva htmlFor), así que
              // la etiqueta se repite aquí: sin esto el campo no tiene nombre accesible.
              aria-label={label}
              disabled={deshabilitado}
              placeholder={placeholder}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px 10px 32px", borderRadius: 10,
                border: `1px solid ${error ? C.danger : C.border}`, fontSize: 13,
                fontFamily: "inherit", outline: "none", background: deshabilitado ? "#F1F5F9" : "#fff",
                color: C.text,
              }}
            />
          </div>

          {!deshabilitado && (
            <div
              role="listbox"
              // Nombre propio: si repitiera el de la etiqueta, el campo tendría dos elementos
              // con el mismo nombre accesible y quedaría ambiguo para un lector de pantalla.
              aria-label={`Sugerencias de ${label}`}
              style={{
                marginTop: 6, borderRadius: 10, border: `1px solid ${C.border}`,
                background: "#fff", padding: 4, maxHeight: 168, overflowY: "auto",
              }}
            >
              {filtradas.length === 0 && (
                <p style={{ fontSize: 11, color: C.textLight, padding: "10px 8px" }}>{textoVacio}</p>
              )}
              {filtradas.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="option"
                  aria-selected={o.id === valor}
                  disabled={o.deshabilitada}
                  onClick={() => elegir(o.id)}
                  title={o.nota}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                    padding: "8px 9px", borderRadius: 8, border: "none", fontFamily: "inherit",
                    background: o.id === valor ? "rgba(57,169,0,.1)" : "transparent",
                    cursor: o.deshabilitada ? "not-allowed" : "pointer",
                    opacity: o.deshabilitada ? 0.5 : 1,
                  }}
                >
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.titulo}
                    </span>
                    {(o.subtitulo || o.nota) && (
                      <span style={{ display: "block", fontSize: 10, color: C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.subtitulo}{o.nota ? ` — ${o.nota}` : ""}
                      </span>
                    )}
                  </span>
                  {o.id === valor && <Check size={13} color={C.primary} style={{ flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}

          {/* Dejarlo sin elegir es una opción válida en algunos campos (el vehículo implicado,
              por ejemplo): se ofrece como acción, no como una fila más de la lista. */}
          {textoSinSeleccion && !deshabilitado && (
            <button
              type="button"
              onClick={() => elegir("")}
              style={{
                marginTop: 6, display: "flex", alignItems: "center", gap: 5, padding: "5px 9px",
                borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff",
                color: C.textLight, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <X size={11} />
              {textoSinSeleccion}
            </button>
          )}
        </>
      )}

      {ayuda && !error && (
        <p style={{ fontSize: 10.5, color: C.textLight, marginTop: 5, lineHeight: 1.45 }}>{ayuda}</p>
      )}
    </FormField>
  );
}
