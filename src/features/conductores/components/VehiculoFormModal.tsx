import { IconCar as Car } from "@tabler/icons-react";
import { EntityFormModal } from "@/components/data";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS } from "../lib/helpers";
import { VehiculoAsociadoFields } from "./VehiculoAsociadoFields";

export interface VehiculoFormState {
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  descripcionVehiculo: string;
}

interface VehiculoFormModalProps {
  form: VehiculoFormState;
  errors: { placa?: string; marca?: string; modelo?: string; color?: string };
  touched: boolean;
  isValid: boolean;
  onChange: (patch: Partial<VehiculoFormState>) => void;
  onMarkTouched: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Edita un vehículo que ya existe. Se abre desde su propia tarjeta: el formulario del
 * conductor ya no lleva vehículo, así que esta es la vía para corregir su placa, marca,
 * línea, modelo o color.
 */
export function VehiculoFormModal({
  form, errors, touched, isValid, onChange, onMarkTouched, onSubmit, onCancel,
}: VehiculoFormModalProps) {
  return (
    <EntityFormModal
      icon={<Car size={18} color={COLORS.primary} />}
      eyebrow="Vehículo"
      title="Editar vehículo"
      onSubmit={onSubmit}
      onCancel={onCancel}
      isValid={isValid}
      submitLabel="Guardar cambios"
    >
      <VehiculoAsociadoFields
        placa={form.placa}
        placaError={touched ? errors.placa : undefined}
        tipoVehiculo={form.tipoVehiculo}
        marca={form.marca}
        marcaError={touched ? errors.marca : undefined}
        linea={form.linea}
        modelo={form.modelo}
        modeloError={touched ? errors.modelo : undefined}
        color={form.color}
        colorError={touched ? errors.color : undefined}
        descripcionVehiculo={form.descripcionVehiculo}
        onPlacaChange={(v) => onChange({ placa: v })}
        onPlacaBlur={onMarkTouched}
        onTipoVehiculoChange={(tipo) => onChange({ tipoVehiculo: tipo })}
        onMarcaChange={(v) => onChange({ marca: v })}
        onMarcaBlur={onMarkTouched}
        onLineaChange={(v) => onChange({ linea: v })}
        onModeloChange={(v) => onChange({ modelo: v })}
        onModeloBlur={onMarkTouched}
        onColorChange={(v) => onChange({ color: v })}
        onColorBlur={onMarkTouched}
        onDescripcionChange={(v) => onChange({ descripcionVehiculo: v })}
      />
    </EntityFormModal>
  );
}
