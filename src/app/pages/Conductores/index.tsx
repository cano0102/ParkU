import { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useData, Conductor, Vehiculo } from "../../context/DataContext";
import { Modal } from "../../components/shared";
import { COLORS, PLACA_REGEX, sanitizeText, emptyForm, FormState, FormErrors } from "./helpers";
import { ConductoresStats } from "./ConductoresStats";
import { ConductoresToolbar } from "./ConductoresToolbar";
import { ConductoresGrid } from "./ConductoresGrid";
import { ConductoresList } from "./ConductoresList";
import { ConductoresPagination } from "./ConductoresPagination";
import { ConductorFormModal } from "./ConductorFormModal";
import { VehiculoView } from "./VehiculoView";
import { conductoresStyles } from "./styles";

export function Conductores() {
  const {
    conductores,
    addConductor,
    updateConductor,
    usuarios,
    vehiculos,
    addVehiculo,
    updateVehiculo,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewVehiculoOpen, setViewVehiculoOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [editingVehiculoId, setEditingVehiculoId] = useState<string | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterVehiculoTipo, setFilterVehiculoTipo] = useState("todos");
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [usuarioSearch, setUsuarioSearch] = useState("");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    setItemsPerPage(mode === "list" ? 15 : 9);
    setCurrentPage(1);
  }, []);

  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const getVehiculosConductor = useCallback((id: string) => vehiculos.filter((v) => v.conductorId === id), [vehiculos]);

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);
  const totalCarros = useMemo(() => vehiculos.filter((v) => v.tipo === "carro").length, [vehiculos]);
  const totalMotos = useMemo(() => vehiculos.filter((v) => v.tipo === "moto").length, [vehiculos]);

  const filteredConductores = useMemo(
    () =>
      conductores.filter((conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        if (!usuario) return false;
        const q = search.toLowerCase();
        const vehiculosCond = getVehiculosConductor(conductor.id);
        const matchVehiculoTipo = filterVehiculoTipo === "todos"
          ? true
          : vehiculosCond.some((v) => v.tipo === filterVehiculoTipo);
        const matchesSearch =
          conductor.nombre.toLowerCase().includes(q) ||
          conductor.email.toLowerCase().includes(q) ||
          conductor.centroFormacion.toLowerCase().includes(q) ||
          vehiculosCond.some((v) =>
            v.placa.toLowerCase().includes(q) ||
            v.marca.toLowerCase().includes(q) ||
            v.modelo.toLowerCase().includes(q)
          );
        const matchesTipo = filterTipo === "todos" ? true : conductor.tipoConductor === filterTipo;
        const matchesEstado = filterEstado === "todos" ? true : conductor.estado === filterEstado;
        return matchesSearch && matchesTipo && matchesEstado && matchVehiculoTipo;
      }),
    [conductores, search, filterTipo, filterEstado, filterVehiculoTipo, getUsuario, getVehiculosConductor]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTipo, filterEstado, filterVehiculoTipo]);

  const totalPages = Math.max(1, Math.ceil(filteredConductores.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedConductores = useMemo(
    () => filteredConductores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredConductores, currentPage, itemsPerPage]
  );

  // Usuarios que ya son conductores (para evitar duplicados), excluyendo el que se está editando
  const usuariosConConductorIds = useMemo(() => {
    const ids = new Set(conductores.map((c) => c.usuarioId));
    if (editingConductor) ids.delete(editingConductor.usuarioId);
    return ids;
  }, [conductores, editingConductor]);

  const usuariosFiltrados = useMemo(() => {
    const q = usuarioSearch.toLowerCase().trim();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.identificacion.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q)
    );
  }, [usuarios, usuarioSearch]);

  const openCreate = useCallback(() => {
    setEditingConductor(null);
    setEditingVehiculoId(null);
    setFormData(emptyForm());
    setFormErrors({});
    setTouched({});
    setUsuarioSearch("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (conductor: Conductor, vehiculo?: Vehiculo) => {
      setEditingConductor(conductor);
      const v = vehiculo ?? vehiculos.find((veh) => veh.conductorId === conductor.id);
      setEditingVehiculoId(v?.id ?? null);
      setFormData({
        usuarioId: conductor.usuarioId,
        tipoConductor: conductor.tipoConductor,
        centroFormacion: conductor.centroFormacion,
        discapacidad: conductor.discapacidad,
        tipoDiscapacidad: conductor.tipoDiscapacidad || "",
        estado: conductor.estado,
        placa: v?.placa || "",
        tipoVehiculo: (v?.tipo as "carro" | "moto") || "carro",
        marca: v?.marca || "",
        descripcionVehiculo: v?.descripcion || "",
      });
      setFormErrors({});
      setTouched({});
      setUsuarioSearch("");
      setDialogOpen(true);
    },
    [vehiculos]
  );

  const openVehiculoView = useCallback((vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewVehiculoOpen(true);
  }, []);

  // Placas ya registradas en otros vehículos (para evitar duplicados), excluyendo el vehículo puntual en edición
  // (no todos los vehículos del conductor, ya que un conductor puede tener varios)
  const placasOcupadas = useMemo(() => {
    return new Set(
      vehiculos
        .filter((v) => v.id !== editingVehiculoId)
        .map((v) => v.placa.toUpperCase().trim())
    );
  }, [vehiculos, editingVehiculoId]);

  // Validación en vivo del formulario
  const validate = useCallback((data: FormState): FormErrors => {
    const errors: FormErrors = {};
    if (!data.usuarioId) {
      errors.usuarioId = "Selecciona un usuario";
    } else if (usuariosConConductorIds.has(data.usuarioId)) {
      errors.usuarioId = "Este usuario ya está registrado como conductor";
    }
    if (!data.centroFormacion.trim()) {
      errors.centroFormacion = "El centro de formación es requerido";
    }
    const placa = data.placa.trim().toUpperCase();
    if (!placa) {
      errors.placa = "La placa es obligatoria";
    } else if (!PLACA_REGEX.test(placa)) {
      errors.placa = "Formato de placa inválido (ej: ABC123)";
    } else if (placasOcupadas.has(placa)) {
      errors.placa = "Esta placa ya está registrada en otro vehículo";
    }
    return errors;
  }, [usuariosConConductorIds, placasOcupadas]);

  useEffect(() => {
    setFormErrors(validate(formData));
  }, [formData, validate]);

  const isValid = useMemo(() => Object.keys(formErrors).length === 0, [formErrors]);

  const usuarioSeleccionado = useMemo(
    () => usuarios.find((u) => u.id === formData.usuarioId),
    [usuarios, formData.usuarioId]
  );

  const markTouched = useCallback((field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const handleSave = useCallback(() => {
    const errors = validate(formData);
    setFormErrors(errors);
    setTouched({ usuarioId: true, centroFormacion: true, placa: true });

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Revisa los campos del formulario");
      return;
    }

    const usuarioSel = usuarios.find((u) => u.id === formData.usuarioId);
    if (!usuarioSel) {
      toast.error("El usuario seleccionado no es válido");
      return;
    }

    const conductorData = {
      usuarioId: formData.usuarioId,
      nombre: usuarioSel.nombre,
      email: usuarioSel.correo,
      tipoConductor: formData.tipoConductor,
      centroFormacion: sanitizeText(formData.centroFormacion.trim()),
      discapacidad: formData.discapacidad,
      tipoDiscapacidad: sanitizeText(formData.tipoDiscapacidad.trim()),
      estado: formData.estado,
      tipo: editingConductor?.tipo || "docente",
    };

    try {
      if (editingConductor) {
        updateConductor(editingConductor.id, conductorData);

        const vehiculoData = {
          placa: formData.placa.toUpperCase().trim(),
          tipo: formData.tipoVehiculo,
          marca: sanitizeText(formData.marca.trim()),
          modelo: "",
          año: new Date().getFullYear(),
          color: "",
          descripcion: sanitizeText(formData.descripcionVehiculo.trim()),
          estado: "activo" as const,
        };

        const existingVehiculo = editingVehiculoId
          ? vehiculos.find((v) => v.id === editingVehiculoId)
          : undefined;
        if (existingVehiculo) {
          updateVehiculo(existingVehiculo.id, vehiculoData);
        } else {
          addVehiculo({
            conductorId: editingConductor.id,
            ...vehiculoData,
            parqueaderoId: "",
            celdaId: "",
            fechaEntrada: new Date().toISOString(),
          });
        }
        toast.success("Conductor actualizado correctamente");
      } else {
        const newId = addConductor(conductorData);
        if (newId) {
          addVehiculo({
            conductorId: newId,
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: sanitizeText(formData.marca.trim()),
            modelo: "",
            año: new Date().getFullYear(),
            color: "",
            descripcion: sanitizeText(formData.descripcionVehiculo.trim()),
            estado: "activo",
            parqueaderoId: "",
            celdaId: "",
            fechaEntrada: new Date().toISOString(),
          });
        }
        toast.success("Conductor creado correctamente");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar el conductor");
      console.error("Error saving conductor:", error);
    }
  }, [formData, editingConductor, editingVehiculoId, usuarios, vehiculos, validate, addConductor, updateConductor, addVehiculo, updateVehiculo]);

  const handleToggleEstado = useCallback(
    (id: string, currentEstado: "activo" | "inactivo") => {
      try {
        const nuevoEstado = currentEstado === "activo" ? "inactivo" : "activo";
        updateConductor(id, { estado: nuevoEstado });
        toast.success(`Conductor ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
      } catch (error) {
        toast.error("Error al cambiar el estado");
        console.error("Error toggling status:", error);
      }
    },
    [updateConductor]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterTipo("todos");
    setFilterEstado("todos");
    setFilterVehiculoTipo("todos");
  }, []);

  const activeFiltersCount = useMemo(
    () =>
      [
        search,
        filterTipo !== "todos" ? filterTipo : "",
        filterEstado !== "todos" ? filterEstado : "",
        filterVehiculoTipo !== "todos" ? filterVehiculoTipo : "",
      ].filter(Boolean).length,
    [search, filterTipo, filterEstado, filterVehiculoTipo]
  );

  const isEdit = !!editingConductor;

  return (
    <>
      <style>{conductoresStyles}</style>

      <div className="conductores-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ConductoresStats
          totalConductores={totalConductores}
          totalActivos={totalActivos}
          totalVehiculos={totalVehiculos}
          totalCarros={totalCarros}
          totalMotos={totalMotos}
        />

        <ConductoresToolbar
          search={search}
          onSearchChange={setSearch}
          filterTipo={filterTipo}
          onFilterTipoChange={setFilterTipo}
          filterVehiculoTipo={filterVehiculoTipo}
          onFilterVehiculoTipoChange={setFilterVehiculoTipo}
          filterEstado={filterEstado}
          onFilterEstadoChange={setFilterEstado}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onCreate={openCreate}
          activeFiltersCount={activeFiltersCount}
          filteredCount={filteredConductores.length}
          onClearFilters={clearFilters}
        />

        {filteredConductores.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              borderRadius: 16,
              border: `2px dashed ${COLORS.border}`,
              background: "#fff",
              color: COLORS.textLight,
            }}
          >
            <User size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron conductores</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <ConductoresGrid
                conductores={paginatedConductores}
                getUsuario={getUsuario}
                getVehiculosConductor={getVehiculosConductor}
                onToggleEstado={handleToggleEstado}
                onViewVehiculo={openVehiculoView}
                onEdit={openEdit}
              />
            ) : (
              <ConductoresList
                conductores={paginatedConductores}
                getUsuario={getUsuario}
                getVehiculosConductor={getVehiculosConductor}
                onToggleEstado={handleToggleEstado}
                onViewVehiculo={openVehiculoView}
                onEdit={openEdit}
              />
            )}

            <ConductoresPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredConductores.length}
              viewMode={viewMode}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Modal de formulario de conductor con vehículo */}
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
        <ConductorFormModal
          isEdit={isEdit}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          touched={touched}
          markTouched={markTouched}
          isValid={isValid}
          usuarioSearch={usuarioSearch}
          setUsuarioSearch={setUsuarioSearch}
          usuariosFiltrados={usuariosFiltrados}
          usuariosConConductorIds={usuariosConConductorIds}
          usuarioSeleccionado={usuarioSeleccionado}
          onSubmit={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>

      {/* Modal de vista de vehículo */}
      <Modal open={viewVehiculoOpen} onClose={() => setViewVehiculoOpen(false)} maxWidth={450}>
        {viewingVehiculo && (
          <VehiculoView
            vehiculo={viewingVehiculo}
            onEdit={() => {
              const conductor = conductores.find((c) => c.id === viewingVehiculo.conductorId);
              if (conductor) {
                setViewVehiculoOpen(false);
                openEdit(conductor, viewingVehiculo);
              }
            }}
            onClose={() => setViewVehiculoOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}
