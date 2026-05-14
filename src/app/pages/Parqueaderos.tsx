/* =========================================================
   PARQUEADEROS UI MODERNO - CRUD COMPLETO
   ========================================================= */

import React, { useMemo, useState } from "react";

import {
  Car,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  X,
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
    parqueaderoSeleccionado,
    setParqueaderoSeleccionado,
  ] = useState<any>(null);

  const [parqueaderos, setParqueaderos] =
    useState([
      {
        id: 1,
        nombre:
          "CARRIL 01 - ZONA CENTRAL",
        total: 12,
        celdas: [
          {
            codigo: "A01",
            estado: "libre",
          },
          {
            codigo: "A02",
            estado: "ocupado",
          },
          {
            codigo: "A03",
            estado: "ocupado",
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
          },
          {
            codigo: "A08",
            estado: "ocupado",
          },
        ],
      },

      {
        id: 2,
        nombre:
          "CARRIL 03 - ZONA NORTE",
        total: 12,
        celdas: [
          {
            codigo: "C01",
            estado: "ocupado",
          },
          {
            codigo: "C02",
            estado: "sena",
          },
          {
            codigo: "C03",
            estado: "libre",
          },
          {
            codigo: "C04",
            estado: "libre",
          },
          {
            codigo: "C05",
            estado: "ocupado",
          },
          {
            codigo: "C06",
            estado: "ocupado",
          },
          {
            codigo: "C07",
            estado: "libre",
          },
          {
            codigo: "C08",
            estado: "ocupado",
          },
        ],
      },
    ]);

  const [form, setForm] = useState({
    nombre: "",
    total: 10,
  });

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
     HELPERS
     ===================================================== */

  const getCeldaStyle = (
    estado: string,
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
        return `
          bg-white
        `;
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
    parqueadero: any,
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
     ELIMINAR
     ===================================================== */

  const handleDelete = (
    id: number,
  ) => {
    const confirmar = window.confirm(
      "¿Eliminar parqueadero?",
    );

    if (!confirmar) return;

    setParqueaderos((prev) =>
      prev.filter((p) => p.id !== id),
    );
  };

  /* =====================================================
     CAMBIAR ESTADO CELDA
     ===================================================== */

  const cambiarEstadoCelda = (
    parqueaderoId: number,
    codigo: string,
  ) => {
    setParqueaderos((prev) =>
      prev.map((parq) => {
        if (parq.id !== parqueaderoId)
          return parq;

        return {
          ...parq,

          celdas: parq.celdas.map(
            (celda) => {
              if (
                celda.codigo !== codigo
              )
                return celda;

              const siguienteEstado =
                celda.estado ===
                "libre"
                  ? "ocupado"
                  : celda.estado ===
                    "ocupado"
                  ? "sena"
                  : "libre";

              return {
                ...celda,
                estado:
                  siguienteEstado,
              };
            },
          ),
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[#ECEDE5] p-5">
      {/* =====================================================
          HERO
         ===================================================== */}

      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#39A900] to-[#2F8500] p-7 text-white shadow-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Panel de Control de
              Estacionamiento
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/90">
              Gestión centralizada de
              celdas y vehículos en
              tiempo real para el SENA.
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
              shadow-lg transition-all
              hover:scale-105
            "
          >
            <Plus className="h-5 w-5" />
            Nuevo Ingreso
          </button>
        </div>

        {/* STATS */}

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              title: "DISPONIBLES",
              value:
                stats.disponibles,
              icon: (
                <CheckCircle2 className="h-5 w-5" />
              ),
            },
            {
              title: "OCUPADOS",
              value: stats.ocupados,
              icon: (
                <XCircle className="h-5 w-5" />
              ),
            },
            {
              title: "RESERVADOS",
              value:
                stats.reservados,
              icon: (
                <BadgeCheck className="h-5 w-5" />
              ),
            },
            {
              title: "TOTAL",
              value: stats.total,
              icon: (
                <Car className="h-5 w-5" />
              ),
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
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                {item.icon}
                {item.title}
              </div>

              <div className="mt-3 text-5xl font-black">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          GRID
         ===================================================== */}

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
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />

                    <h2 className="text-sm font-black tracking-wide text-green-800">
                      {
                        parqueadero.nombre
                      }
                    </h2>
                  </div>

                  <div className="mt-1 text-sm font-bold text-zinc-500">
                    {
                      parqueadero.total
                    }{" "}
                    CELDAS
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      openEdit(
                        parqueadero,
                      )
                    }
                    className="
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    p-3
                    text-zinc-700
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
                    border
                    border-red-200
                    bg-red-50
                    p-3
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
                        cambiarEstadoCelda(
                          parqueadero.id,
                          celda.codigo,
                        )
                      }
                      className={`
                      h-[95px]
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

                        <div>
                          {celda.estado ===
                          "libre" ? (
                            <Plus className="h-6 w-6" />
                          ) : (
                            <Car className="h-6 w-6" />
                          )}
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-widest">
                          {celda.estado ===
                          "libre"
                            ? "LIBRE"
                            : celda.estado ===
                              "sena"
                            ? "SENA VIP"
                            : "OCUPADO"}
                        </div>
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
          MODAL CREAR
         ===================================================== */}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Nuevo Parqueadero
              </h2>

              <button
                onClick={() =>
                  setCreateOpen(false)
                }
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombre:
                      e.target.value,
                  })
                }
                className="
                  h-12 w-full rounded-xl
                  border border-zinc-200
                  px-4 outline-none
                "
              />

              <input
                type="number"
                placeholder="Total"
                value={form.total}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total: Number(
                      e.target.value,
                    ),
                  })
                }
                className="
                  h-12 w-full rounded-xl
                  border border-zinc-200
                  px-4 outline-none
                "
              />
            </div>

            <button
              onClick={handleCreate}
              className="
                mt-6 h-12 w-full rounded-xl
                bg-[#39A900]
                font-bold text-white
              "
            >
              Crear Parqueadero
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL EDITAR
         ===================================================== */}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Editar Parqueadero
              </h2>

              <button
                onClick={() =>
                  setEditOpen(false)
                }
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nombre:
                      e.target.value,
                  })
                }
                className="
                  h-12 w-full rounded-xl
                  border border-zinc-200
                  px-4 outline-none
                "
              />

              <input
                type="number"
                placeholder="Total"
                value={form.total}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total: Number(
                      e.target.value,
                    ),
                  })
                }
                className="
                  h-12 w-full rounded-xl
                  border border-zinc-200
                  px-4 outline-none
                "
              />
            </div>

            <button
              onClick={handleEdit}
              className="
                mt-6 h-12 w-full rounded-xl
                bg-blue-600
                font-bold text-white
              "
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}