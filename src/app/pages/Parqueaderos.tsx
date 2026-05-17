/* =========================================================
   PARQUEADEROS UI MODERNO - FRONTEND COMPLETO
   ========================================================= */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Car,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  X,
  Camera,
  User,
} from "lucide-react";

export default function Parqueaderos() {
  /* =====================================================
     STATES
     ===================================================== */

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    ingresoOpen,
    setIngresoOpen,
  ] = useState(false);

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const videoRef = useRef(null);

  const [
    parqueaderoSeleccionado,
    setParqueaderoSeleccionado,
  ] = useState(null);

  const [celdaSeleccionada, setCeldaSeleccionada] =
    useState(null);

  const [parqueaderos, setParqueaderos] =
    useState([
      {
        id: 1,
        nombre:
          "CARRIL 01 - ZONA CENTRAL",

        total: 8,

        celdas: [
          {
            codigo: "A01",
            estado: "libre",
          },

          {
            codigo: "A02",
            estado: "ocupado",

            placa: "ABC123",

            conductor:
              "Carlos Ramirez",
          },

          {
            codigo: "A03",
            estado: "libre",
          },

          {
            codigo: "A04",
            estado: "sena",
          },

          {
            codigo: "A05",
            estado: "libre",
          },

          {
            codigo: "A06",
            estado: "libre",
          },

          {
            codigo: "A07",
            estado: "ocupado",

            placa: "XYZ987",

            conductor:
              "Laura Torres",
          },

          {
            codigo: "A08",
            estado: "libre",
          },
        ],
      },
    ]);

  const [form, setForm] = useState({
    nombre: "",
    total: 10,
  });

  const [vehiculoForm, setVehiculoForm] =
    useState({
      placa: "",

      conductor: "",
    });

  /* =====================================================
     CONDUCTORES MOCK
     ===================================================== */

  const conductores = [
    "Carlos Ramirez",

    "Laura Torres",

    "Andres Perez",

    "Maria Gomez",

    "Daniel Castro",
  ];

  /* =====================================================
     STATS
     ===================================================== */

  const stats = useMemo(() => {
    const todas =
      parqueaderos.flatMap(
        (p) => p.celdas,
      );

    return {
      disponibles: todas.filter(
        (c) => c.estado === "libre",
      ).length,

      ocupados: todas.filter(
        (c) =>
          c.estado === "ocupado",
      ).length,

      reservados: todas.filter(
        (c) => c.estado === "sena",
      ).length,

      total: todas.length,
    };
  }, [parqueaderos]);

  /* =====================================================
     CAMERA
     ===================================================== */

  useEffect(() => {
    if (scannerOpen) {
      iniciarCamara();
    }
  }, [scannerOpen]);

  const iniciarCamara = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode:
                "environment",
            },
          },
        );

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cerrarCamara = () => {
    const stream =
      videoRef.current?.srcObject;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop(),
        );
    }
  };

  const tomarFoto = () => {
    setVehiculoForm({
      ...vehiculoForm,

      placa: "ABC123",
    });

    cerrarCamara();

    setScannerOpen(false);
  };

  /* =====================================================
     HELPERS
     ===================================================== */

  const getCeldaStyle = (
    estado,
  ) => {
    switch (estado) {
      case "libre":
        return `
          border-2 border-dashed border-green-400
          bg-green-50
          text-green-700
        `;

      case "ocupado":
        return `
          bg-zinc-900
          text-white
          border-b-4 border-red-500
        `;

      case "sena":
        return `
          bg-yellow-50
          text-yellow-700
          border border-yellow-300
        `;

      default:
        return "bg-white";
    }
  };

  /* =====================================================
     CREAR
     ===================================================== */

  const handleCreate = () => {
    if (!form.nombre) return;

    const nuevo = {
      id: Date.now(),

      nombre: form.nombre,

      total: form.total,

      celdas: Array.from({
        length: form.total,
      }).map((_, index) => ({
        codigo: `P${index + 1}`,

        estado: "libre",
      })),
    };

    setParqueaderos([
      ...parqueaderos,
      nuevo,
    ]);

    setCreateOpen(false);

    setForm({
      nombre: "",

      total: 10,
    });
  };

  /* =====================================================
     EDITAR
     ===================================================== */

  const openEdit = (
    parqueadero,
  ) => {
    setParqueaderoSeleccionado(
      parqueadero,
    );

    setForm({
      nombre: parqueadero.nombre,

      total: parqueadero.total,
    });

    setEditOpen(true);
  };

  const handleEdit = () => {
    setParqueaderos((prev) =>
      prev.map((p) =>
        p.id ===
        parqueaderoSeleccionado.id
          ? {
              ...p,

              nombre: form.nombre,

              total: form.total,
            }
          : p,
      ),
    );

    setEditOpen(false);
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const handleDelete = (id) => {
    const confirmar = window.confirm(
      "¿Eliminar parqueadero?",
    );

    if (!confirmar) return;

    setParqueaderos((prev) =>
      prev.filter((p) => p.id !== id),
    );
  };

  /* =====================================================
     CLICK CELDA
     ===================================================== */

  const handleClickCelda = (
    parqueaderoId,
    celda,
  ) => {
    if (celda.estado !== "libre")
      return;

    setCeldaSeleccionada({
      parqueaderoId,

      codigo: celda.codigo,
    });

    setVehiculoForm({
      placa: "",

      conductor: "",
    });

    setIngresoOpen(true);
  };

  /* =====================================================
     REGISTRAR VEHICULO
     ===================================================== */

  const registrarVehiculo = () => {
    if (
      !vehiculoForm.placa ||
      !vehiculoForm.conductor
    )
      return;

    setParqueaderos((prev) =>
      prev.map((parq) => {
        if (
          parq.id !==
          celdaSeleccionada.parqueaderoId
        )
          return parq;

        return {
          ...parq,

          celdas: parq.celdas.map(
            (celda) => {
              if (
                celda.codigo !==
                celdaSeleccionada.codigo
              )
                return celda;

              return {
                ...celda,

                estado: "ocupado",

                placa:
                  vehiculoForm.placa,

                conductor:
                  vehiculoForm.conductor,
              };
            },
          ),
        };
      }),
    );

    setIngresoOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#ECEDE5] p-5">
      {/* HERO */}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#39A900] to-[#2F8500] p-7 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Panel de Parqueaderos
            </h1>

            <p className="mt-3 text-sm text-white/90">
              Gestión moderna de
              celdas vehiculares
            </p>
          </div>

          <button
            onClick={() =>
              setCreateOpen(true)
            }
            className="
              flex items-center gap-2
              rounded-2xl bg-white px-6 py-4
              font-semibold text-zinc-800
            "
          >
            <Plus className="h-5 w-5" />
            Nuevo Parqueadero
          </button>
        </div>

        {/* STATS */}

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              title: "DISPONIBLES",

              value:
                stats.disponibles,
            },

            {
              title: "OCUPADOS",

              value: stats.ocupados,
            },

            {
              title: "RESERVADOS",

              value:
                stats.reservados,
            },

            {
              title: "TOTAL",

              value: stats.total,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="
                rounded-[24px]
                bg-green-500/20
                p-5
              "
            >
              <div className="text-sm font-semibold text-white/80">
                {item.title}
              </div>

              <div className="mt-3 text-5xl font-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRID */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {parqueaderos.map(
          (parqueadero) => (
            <div
              key={parqueadero.id}
              className="rounded-[28px] bg-[#F5F5EF] p-5 shadow-sm"
            >
              {/* HEADER */}

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-green-800">
                    {
                      parqueadero.nombre
                    }
                  </h2>

                  <div className="text-sm font-bold text-zinc-500">
                    {
                      parqueadero.total
                    }{" "}
                    CELDAS
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      openEdit(
                        parqueadero,
                      )
                    }
                    className="
                      rounded-xl border
                      border-zinc-200
                      bg-white p-3
                    "
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        parqueadero.id,
                      )
                    }
                    className="
                      rounded-xl
                      border border-red-200
                      bg-red-50 p-3
                      text-red-600
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CELDAS */}

              <div className="grid grid-cols-4 gap-4">
                {parqueadero.celdas.map(
                  (celda) => (
                    <button
                      key={celda.codigo}
                      onClick={() =>
                        handleClickCelda(
                          parqueadero.id,
                          celda,
                        )
                      }
                      className={`
                        h-[120px]
                        rounded-[22px]
                        p-3
                        transition-all
                        hover:scale-105
                        ${getCeldaStyle(
                          celda.estado,
                        )}
                      `}
                    >
                      <div className="flex h-full flex-col items-center justify-between">
                        <div className="text-lg font-black">
                          {
                            celda.codigo
                          }
                        </div>

                        <Car className="h-7 w-7" />

                        {celda.estado ===
                        "ocupado" ? (
                          <div className="text-center">
                            <div className="text-xs font-black">
                              {
                                celda.placa
                              }
                            </div>

                            <div className="text-[10px]">
                              {
                                celda.conductor
                              }
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold uppercase tracking-widest">
                            {celda.estado}
                          </div>
                        )}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* =====================================================
          MODAL INGRESO
      ===================================================== */}

      {ingresoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  Registrar Vehículo
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Celda{" "}
                  {
                    celdaSeleccionada?.codigo
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setIngresoOpen(false)
                }
              >
                <X />
              </button>
            </div>

            {/* PLACA */}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Matrícula
              </label>

              <div className="flex gap-3">
                <input
                  value={
                    vehiculoForm.placa
                  }
                  onChange={(e) =>
                    setVehiculoForm({
                      ...vehiculoForm,

                      placa:
                        e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC123"
                  className="
                    h-14 flex-1 rounded-2xl
                    border border-zinc-200
                    px-5 text-xl
                    font-black uppercase
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setScannerOpen(true)
                  }
                  className="
                    flex items-center gap-2
                    rounded-2xl bg-black
                    px-5 font-bold text-white
                  "
                >
                  <Camera className="h-5 w-5" />
                  Escanear
                </button>
              </div>
            </div>

            {/* CONDUCTOR */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Conductor
              </label>

              <select
                value={
                  vehiculoForm.conductor
                }
                onChange={(e) =>
                  setVehiculoForm({
                    ...vehiculoForm,

                    conductor:
                      e.target.value,
                  })
                }
                className="
                  h-14 w-full rounded-2xl
                  border border-zinc-200
                  px-5 outline-none
                "
              >
                <option value="">
                  Seleccionar
                </option>

                {conductores.map(
                  (conductor) => (
                    <option
                      key={conductor}
                    >
                      {conductor}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* BUTTON */}

            <button
              onClick={
                registrarVehiculo
              }
              className="
                mt-7 h-14 w-full
                rounded-2xl
                bg-[#39A900]
                font-black text-white
              "
            >
              Registrar Vehículo
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL CAMARA
      ===================================================== */}

      {scannerOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-5">
          <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-zinc-200 p-5">
              <div>
                <h2 className="text-3xl font-black">
                  Escanear Matrícula
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Simulación de captura
                </p>
              </div>

              <button
                onClick={() => {
                  cerrarCamara();

                  setScannerOpen(
                    false,
                  );
                }}
                className="rounded-xl bg-zinc-100 p-2"
              >
                <X />
              </button>
            </div>

            {/* CAMERA */}

            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-[500px] w-full object-cover"
              />

              {/* FRAME */}

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[180px] w-[340px] rounded-[30px] border-4 border-green-500 shadow-[0_0_0_9999px_rgba(0,0,0,.45)]" />
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex justify-center gap-3 p-5">
              <button
                onClick={() => {
                  cerrarCamara();

                  setScannerOpen(
                    false,
                  );
                }}
                className="
                  h-14 rounded-2xl
                  border border-zinc-300
                  px-8 font-bold
                "
              >
                Cancelar
              </button>

              <button
                onClick={tomarFoto}
                className="
                  h-14 rounded-2xl
                  bg-[#39A900]
                  px-8 font-black
                  text-white
                "
              >
                Tomar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}