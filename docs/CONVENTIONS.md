# Convenciones de ParkU

Resumen de las convenciones de arquitectura y nombres establecidas durante la
reestructuración del proyecto (fases 1-8). Es el criterio a seguir para
cualquier código nuevo — no hay excepciones documentadas a propósito.

## Estructura de carpetas (`src/`)

```
src/
  App.tsx, theme.ts, main.tsx, vite-env.d.ts   — entrypoints
  routes/          — enrutamiento: index.tsx (router), ProtectedRoute, RouteFallback, NotFound
  layouts/         — layouts de la app autenticada (MainLayout)
  context/         — Context de React para estado de sesión global (hoy solo AuthContext)
  components/
    shared/        — primitivas reutilizables en toda la app (Modal, FormField, StatusBadge, ConfirmDialog, Toaster, ErrorBoundary)
    data/          — building blocks de pantallas de gestión (DataGrid, DataList, DataToolbar, DataPagination, StatsPanel, EntityFormModal)
    scanner/       — shell de cámara genérico (CameraScanner); los flujos concretos (OCR de placa, QR de cédula) siguen en su feature — ver services/ más abajo
  features/<dominio>/   — un dominio de negocio por carpeta (ver abajo)
  services/
    core/          — store interno + fábrica de CRUD/React Query, sin importar nada del proyecto
    api/           — un módulo por dominio (ver abajo)
  hooks/           — hooks genéricos sin estado de dominio (useMobile)
  utils/           — funciones puras compartidas entre features (cn, format, validation)
  types/           — tipos de entidad de dominio (Rol, Usuario, Conductor, Vehiculo, Celda, Parqueadero, Reserva, Incidente, ControlSalida, Movimiento)
  assets/images/    — imágenes estáticas
```

## `features/<dominio>/`

Cada feature es un dominio de negocio con ruta propia en `routes.tsx`:
`auth`, `dashboard`, `roles`, `usuarios`, `conductores`, `parqueaderos`,
`control-salida`, `reservas`, `incidentes`, `perfil`, `landing`.

- El punto de entrada de cada feature es `index.tsx` (excepto `auth/`, que
  tiene 4 archivos de nivel superior — `Login.tsx`, `Register.tsx`,
  `ForgotPassword.tsx`, `ResetPassword.tsx` — porque son 4 pantallas
  independientes, no una con sub-vistas).
- **Una feature no puede importar de otra feature**, salvo a través del
  barril `index.ts` de la feature consumida (ver Fase 6). Si dos features
  necesitan la misma lógica que no es específica de dominio, esa lógica
  sube a `services/`, `utils/`, `components/` o `types/`. Es una regla
  forzada por `eslint-plugin-boundaries` (ver `eslint.config.js`); los
  hooks de dominio (ver tabla de propiedad más abajo) son hoy la única
  excepción tolerada mientras no existan los barriles.
- `helpers.ts` dentro de una feature es para lo que es *verdaderamente*
  específico de ese dominio (estilos de tarjeta, constantes de UI locales).
  Si una función se necesita en más de una feature, no vive en un
  `helpers.ts` — vive en `utils/`.
- Los modales de alta/edición de una entidad se apoyan en
  `components/data/EntityFormModal`; los flujos de cámara (OCR de placa, QR
  de cédula) se apoyan en `components/scanner/CameraScanner`.
- **Toda feature que supere los 8 archivos se subdivide por rol**:
  `components/` (modales, tarjetas, vistas de detalle — todo lo que
  renderiza JSX propio del dominio), `hooks/` (los de React Query, ver
  tabla de propiedad en la sección `services/`), `lib/` (`helpers.ts`,
  `styles.ts` y cualquier adaptador no-React sobre un `services/api/*`,
  como `lib/ocrAdapter.ts`). El punto de entrada (`index.tsx` +
  `index.test.tsx`) se queda en la raíz de la feature. Implementación de
  referencia: `features/parqueaderos/` (17 archivos → components/{map,modals}/,
  hooks/, lib/); a menor escala, `features/conductores/` y
  `features/usuarios/`. Las features de 2 archivos (`index.tsx` +
  `index.test.tsx`) no se subdividen — sería sobreingeniería.

## `services/`

Dividido en dos capas desde la Fase 4 de la reestructuración estructural:

- **`services/core/`** — infraestructura sin dueño de dominio: `db.ts`
  (store interno en memoria, antes `_db.ts`), `crud.ts` (fábrica de CRUD,
  antes `_crud.ts`), `queryFactory.ts` (fábrica de hooks de React Query,
  antes `hooks/_factory.ts`) y `firebase.ts`. El prefijo `_` que marcaba
  estos archivos como "internos" se retiró: vivir en `core/` ya comunica
  eso por ubicación, y `core/` no importa nada del resto del proyecto
  (solo librerías externas) — es la capa más baja.
- **`services/api/`** — un módulo por dominio (`roles.ts`, `usuarios.ts`,
  `conductores.ts`, `vehiculos.ts`, `parqueaderos.ts`, `celdas.ts`,
  `controlSalida.ts`, `reservas.ts`, `incidentes.ts`, `auth.ts`, `ocr.ts`,
  `qr.ts`), cada uno exponiendo exactamente
  `getAll/getById/create/update/remove` (todos `async`) salvo las
  excepciones documentadas abajo. Importan solo de `services/core/` y
  `@/types`.
- `movimientos.ts` es la excepción CRUD: no tiene alta/edición/borrado
  propios porque es 100% derivado de `controlSalida` + `vehiculos` +
  `conductores` — solo expone `getBase()` (los registros de demo fijos);
  el cálculo derivado vive en `features/parqueaderos/hooks/useMovimientos.ts`.
- **Solo `services/` puede importar el SDK de Firebase** (`firebase/*`).
  Hoy esa integración vive en `services/core/firebase.ts` y no está
  conectada a ningún flujo activo — login/registro/reset corren contra el
  mock de `services/api/auth.ts`. Forzado por `no-restricted-imports` en
  `eslint.config.js`.

### Propiedad de subdominios (hooks de React Query)

Los hooks de React Query (`useRoles`, `useConductores`, etc.) ya no viven
centralizados en `services/hooks/` — cada uno bajó a `features/<dominio>/hooks/`
de la feature que lo consume principalmente. Tabla de propiedad, incluyendo
los 5 dominios que no tenían una feature de UI propia y por eso quedaban
"huérfanos":

| Servicio (`services/api/`) | Hook (`features/<x>/hooks/`) | Dueño | Motivo |
|---|---|---|---|
| `roles.ts` | `useRoles.ts` | `features/roles/` | ruta propia |
| `usuarios.ts` | `useUsuarios.ts` | `features/usuarios/` | ruta propia |
| `conductores.ts` | `useConductores.ts` | `features/conductores/` | ruta propia |
| `parqueaderos.ts` | `useParqueaderos.ts` | `features/parqueaderos/` | ruta propia |
| `reservas.ts` | `useReservas.ts` | `features/reservas/` | ruta propia |
| `incidentes.ts` | `useIncidentes.ts` | `features/incidentes/` | ruta propia |
| `controlSalida.ts` | `useControlSalida.ts` | `features/control-salida/` | ruta propia |
| `celdas.ts` | `useCeldas.ts` | `features/parqueaderos/` | las celdas son un sub-recurso del plano de parqueaderos, sin vista propia |
| `vehiculos.ts` | `useVehiculos.ts` | `features/conductores/` | un vehículo siempre cuelga de un conductor; `VehiculoView` vive en `conductores/components/` |
| `movimientos.ts` | `useMovimientos.ts` | `features/parqueaderos/` | el cálculo combina controlSalida+vehiculos+conductores pero su único consumidor real es el dashboard de parqueaderos |
| `auth.ts` | — (sin hook) | — | no es una colección CRUD; `AuthContext` lo consume directo |
| `ocr.ts` | — (sin hook) | — | pipeline de imagen puro; el adaptador React vive en `features/parqueaderos/lib/` |
| `qr.ts` | — (sin hook) | — | decodificador puro; lo consume `ScannerQR` directo |

**Nota sobre acoplamiento cruzado (deuda temporal, se resuelve en la Fase 6):**
varias pantallas necesitan datos de dominios que no les pertenecen — el
`dashboard` agrega prácticamente todos, `reservas`/`incidentes`/`control-salida`
necesitan celdas+vehículos+conductores+usuarios+parqueaderos para mostrar
contexto. Mover cada hook a su feature dueña hizo explícitos esos cruces
como imports profundos (`@/features/conductores/hooks/useConductores` desde
`features/dashboard/index.tsx`), que hoy son una excepción tolerada a "una
feature no importa de otra feature". La Fase 6 los resuelve dándole a cada
feature un barril `index.ts` que reexporte su API pública (incluidos los
hooks que otras features consumen) — a partir de ahí el cruce pasa a ser
`@/features/conductores` (vía barril) en vez de un import profundo a
`.../hooks/useConductores`.

## `components/data/`

Building blocks genéricos para cualquier pantalla de "listar + filtrar +
paginar + crear/editar" una entidad. Antes de escribir una pantalla de
gestión nueva, revisar si ya se puede componer con
`DataGrid`/`DataList`/`DataToolbar`/`DataPagination`/`StatsPanel` en vez de
reescribir el layout desde cero (ver `features/conductores` y
`features/usuarios` como referencia).

## Tipos (`types/`)

Los tipos de entidad de dominio están centralizados en `src/types/`. Cada
`services/<dominio>.ts` reexporta el tipo que le corresponde (p. ej.
`export type { Rol }` en `services/roles.ts`) para que el resto del código
siga importándolo desde el servicio, sin tener que conocer `types/`
directamente. No se crean tipos de entidad duplicados dentro de una
feature — si una feature necesita un tipo que no es una entidad de dominio
(p. ej. el estado de un formulario), ese tipo sí vive local a la feature.

## Alias de imports

Todo import que cruce el límite de una carpeta de primer nivel de `src/`
usa el alias `@/` (`@/services/...`, `@/features/...`, `@/components/...`,
`@/utils/...`, `@/types`, `@/theme`, `@/context/AuthContext`) en vez de
rutas relativas largas (`../../../`). Los imports relativos (`./`, `../`)
se reservan para archivos dentro de la misma carpeta o un nivel inmediato
de profundidad.

## Tests

- Los tests viven junto al archivo que prueban: `X.ts` → `X.test.ts`,
  `X.tsx` → `X.test.tsx`.
- `src/test/crudContract.ts` da una batería de pruebas de contrato CRUD
  reutilizable para cualquier `services/<dominio>.ts` nuevo —
  `describeCrudContract<T>(nombre, servicio, buildSample, patchSample)`.
- `src/test/queryWrapper.tsx` da `withQueryClient()`/`createTestQueryClient()`
  para probar hooks construidos sobre React Query sin compartir caché entre
  tests.
- Los datos de prueba corren contra el store real en memoria de
  `services/core/db.ts` (no hay Firebase que mockear — es mock por diseño,
  ver arriba), igual que corre la app real.
- Algunos tests de hooks (p. ej. `services/core/queryFactory.test.ts`,
  `features/parqueaderos/hooks/useMovimientos.test.ts`) importan hooks de
  otras features para probar la fábrica genérica o un flujo derivado
  end-to-end — es el mismo acoplamiento cruzado documentado arriba,
  tolerado en tests hasta que existan los barriles de la Fase 6.

## Lint (`eslint.config.js`)

`npm run lint` corre `eslint-plugin-boundaries` (las reglas de esta página,
forzadas por herramienta) más `typescript-eslint` y `eslint-plugin-react-hooks`
recomendados. `@typescript-eslint/no-explicit-any` está en `warn` (no
`error`): hay deuda técnica preexistente de tipado en unos pocos puntos
(sobre todo retornos de librerías externas como Tesseract OCR); código
nuevo debería evitar `any`, pero no se bloquea CI por deuda ya existente
antes de instalar el linter.
