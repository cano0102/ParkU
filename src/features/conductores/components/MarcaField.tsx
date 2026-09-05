import { useMemo, useRef, useState } from "react";
import { FormField } from "@/components/shared";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, inputStyle, inputErrorStyle } from "../lib/helpers";
import { sugerirMarcas } from "../lib/marcas";

interface MarcaFieldProps {
  tipoVehiculo: Vehiculo["tipo"];
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

/**
 * Marca del vehículo: se escribe libremente y se sugieren las que más ruedan en Colombia,
 * filtradas por el tipo elegido (a una moto no se le ofrece "Chevrolet").
 *
 * No es un desplegable cerrado a propósito: siempre aparecerá una marca que no esté en la
 * lista, y quedarse sin poder registrar el vehículo por eso sería peor que teclearla.
 */
export function MarcaField({ tipoVehiculo, value, error, onChange, onBlur }: MarcaFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const cerrando = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sugerencias = useMemo(() => sugerirMarcas(tipoVehiculo, value), [tipoVehiculo, value]);
  // Con la marca ya escrita exactamente igual que la única sugerencia, el desplegable no
  // aporta nada.
  const mostrar = abierto && sugerencias.length > 0
    && !(sugerencias.length === 1 && sugerencias[0].toLowerCase() === value.trim().toLowerCase());

  const elegir = (marca: string) => {
    onChange(marca);
    setAbierto(false);
  };

  return (
    <FormField label="Marca *" error={error}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={tipoVehiculo === "moto" ? "ej. Bajaj" : "ej. Chevrolet"}
          value={value}
          role="combobox"
          aria-expanded={mostrar}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={(e) => { onChange(e.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          onBlur={() => {
            // El clic en una sugerencia dispara antes el blur del input: se cierra con un
            // respiro para que el onMouseDown de la opción llegue a ejecutarse.
            cerrando.current = setTimeout(() => setAbierto(false), 120);
            onBlur();
          }}
          style={{ ...inputStyle, ...(error ? inputErrorStyle : {}) }}
        />

        {mostrar && (
          <ul
            role="listbox"
            aria-label="Marcas sugeridas"
            style={{
              position: "absolute", zIndex: 5, top: "calc(100% + 4px)", left: 0, right: 0,
              margin: 0, padding: 4, listStyle: "none", maxHeight: 168, overflowY: "auto",
              background: "#fff", borderRadius: 11, border: `1px solid ${COLORS.border}`,
              boxShadow: "0 10px 24px rgba(15,23,42,.10)",
            }}
          >
            {sugerencias.map((marca) => (
              <li key={marca}>
                <button
                  type="button"
                  role="option"
                  aria-selected={marca.toLowerCase() === value.trim().toLowerCase()}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (cerrando.current) clearTimeout(cerrando.current);
                    elegir(marca);
                  }}
                  style={{
                    width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8,
                    border: "none", background: "transparent", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12.5, color: COLORS.text,
                  }}
                  className="usuario-option"
                >
                  {marca}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormField>
  );
}
