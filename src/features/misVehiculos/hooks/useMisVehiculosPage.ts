import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useConductoresData } from "@/features/conductores/hooks/useConductoresData";
import { vehiculosDeConductor } from "@/features/conductores/lib/ocupacion";
import {
  validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca,
} from "@/features/conductores/lib/helpers";
import type { VehiculoFormState } from "@/features/conductores/components/VehiculoFormModal";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useCrearMiVehiculo } from "./useCrearMiVehiculo";

/** true si `conductorId` es el propietario PRINCIPAL de ese vehículo (no un copropietario). */
function esPrincipal(vehiculo: Vehiculo, conductorId: string): boolean {
  return vehiculo.conductorId === conductorId;
}

/** Página "Mis Vehículos" (autoservicio del rol Conductor): ver, crear y editar (solo si es
 *  el propietario principal) los vehículos vinculados a la propia cuenta. */
export function useMisVehiculosPage() {
  const { user } = useAuth();
  const data = useConductoresData();

  const miConductor = useMemo(
    () => data.conductores.find((c) => c.usuarioId === user?.id) ?? null,
    [data.conductores, user?.id]
  );

  const misVehiculos = useMemo(
    () => vehiculosDeConductor(data.vehiculos, miConductor?.id),
    [data.vehiculos, miConductor]
  );

  // ----- vista (cuadrícula / lista) + búsqueda -----
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const misVehiculosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return misVehiculos;
    return misVehiculos.filter(
      (v) => v.placa.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q) || (v.linea ?? "").toLowerCase().includes(q)
    );
  }, [misVehiculos, search]);

  // ----- crear / vincular como copropietario -----
  const crear = useCrearMiVehiculo(data, miConductor);

  // ----- ver detalle -----
  const [viewing, setViewing] = useState<Vehiculo | null>(null);
  const openView = useCallback((v: Vehiculo) => setViewing(v), []);
  const closeView = useCallback(() => setViewing(null), []);

  // ----- editar (solo si es principal) -----
  const [editando, setEditando] = useState<Vehiculo | null>(null);
  const [form, setForm] = useState<VehiculoFormState | null>(null);
  const [touched, setTouched] = useState(false);
  const markTouched = useCallback(() => setTouched(true), []);

  const abrirEditar = useCallback((v: Vehiculo) => {
    if (!miConductor || !esPrincipal(v, miConductor.id)) {
      toast.error("Solo el propietario principal puede editar este vehículo.");
      return;
    }
    setViewing(null);
    setEditando(v);
    setTouched(false);
    setForm({
      placa: v.placa,
      tipoVehiculo: v.tipo,
      marca: v.marca,
      linea: v.linea ?? "",
      modelo: v.modelo ? String(v.modelo) : "",
      color: v.color,
      descripcionVehiculo: v.descripcion ?? "",
    });
  }, [miConductor]);

  const cerrarEditar = useCallback(() => {
    setEditando(null);
    setForm(null);
  }, []);

  const erroresEdicion = useMemo(() => {
    const errores: { placa?: string; marca?: string; modelo?: string; color?: string } = {};
    if (!form) return errores;
    const placa = form.placa.trim().toUpperCase();
    if (!placa) {
      errores.placa = "La placa es obligatoria";
    } else if (!validarPlacaColombiana(placa)) {
      errores.placa = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    } else if ((form.tipoVehiculo === "carro" || form.tipoVehiculo === "moto") && !validarPlacaPorTipo(placa, form.tipoVehiculo)) {
      errores.placa = `Seleccionaste "${form.tipoVehiculo}", pero la placa tiene formato de ${tipoVehiculoDesdePlaca(placa)}.`;
    } else if (data.vehiculos.some((v) => v.id !== editando?.id && v.placa.toUpperCase().trim() === placa)) {
      errores.placa = "Esta placa ya está registrada en otro vehículo";
    }
    if (!form.marca.trim()) errores.marca = "La marca es obligatoria";
    if (!form.color.trim()) errores.color = "El color es obligatorio";
    const modelo = form.modelo.trim();
    if (modelo) {
      const anio = Number(modelo);
      const anioMaximo = new Date().getFullYear() + 1;
      if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
        errores.modelo = `El modelo es el año del vehículo: entre 1950 y ${anioMaximo}`;
      }
    }
    return errores;
  }, [form, editando, data.vehiculos]);

  const guardarEdicion = useCallback(async () => {
    if (!editando || !form) return;
    setTouched(true);
    if (Object.values(erroresEdicion).some(Boolean)) return;
    try {
      await data.updateVehiculo(editando.id, {
        placa: form.placa.toUpperCase().trim(),
        tipo: form.tipoVehiculo,
        marca: form.marca.trim(),
        linea: form.linea.trim(),
        modelo: form.modelo ? Number(form.modelo) : null,
        color: form.color.trim(),
        descripcion: form.descripcionVehiculo.trim(),
      });
      toast.success("Vehículo actualizado");
      cerrarEditar();
    } catch (error) {
      console.error("Error actualizando mi vehículo:", error);
    }
  }, [editando, form, erroresEdicion, data, cerrarEditar]);

  return {
    isLoading: data.isLoading,
    miConductor, misVehiculos, misVehiculosFiltrados, esPrincipal,
    viewMode, setViewMode, search, setSearch,
    crear,
    viewing, openView, closeView,
    editando, form, setForm, touched, markTouched, erroresEdicion, abrirEditar, cerrarEditar, guardarEdicion,
  };
}
