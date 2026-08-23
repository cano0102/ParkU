# Convenciones de ParkU

Resumen de las convenciones de arquitectura y nombres establecidas durante la
reestructuración del proyecto (fases 1-8). Es el criterio a seguir para
cualquier código nuevo — no hay excepciones documentadas a propósito.

## Estructura de carpetas (`src/`)

```
src/
  App.tsx, routes.tsx, theme.ts, main.tsx   — entrypoints, sin carpeta app/ de por medio
  layouts/         — layouts de la app autenticada (MainLayout)
  context/         — Context de React para estado de sesión global (hoy solo AuthContext)
  components/
    shared/        — primitivas reutilizables en toda la app (Modal, FormField, StatusBadge, ConfirmDialog, Toaster)
    data/          — building blocks de pantallas de gestión (DataGrid, DataList, DataToolbar, DataPagination, StatsPanel, EntityFormModal, CameraScanner)
    ProtectedRoute.tsx, NotFound.tsx, ErrorBoundary.tsx, RouteFallback.tsx — infraestructura de ruteo, no van dentro de shared/ ni data/
  features/<dominio>/   — un dominio de negocio por carpeta (ver abajo)
  services/        — única capa que toca "el backend" (ver más abajo)
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
- **Una feature no puede importar de otra feature.** Si dos features
  necesitan la misma lógica, esa lógica sube a `services/`, `utils/`,
  `components/` o `types/` — nunca se importa cruzado entre `features/`.
  Esto es una regla dura, forzada por `eslint-plugin-boundaries` (ver
  `eslint.config.js`), no solo una convención de honor.
- `helpers.ts` dentro de una feature es para lo que es *verdaderamente*
  específico de ese dominio (estilos de tarjeta, constantes de UI locales).
  Si una función se necesita en más de una feature, no vive en un
  `helpers.ts` — vive en `utils/`.
- Los modales de alta/edición de una entidad se apoyan en
  `components/data/EntityFormModal`; los flujos de cámara (OCR de placa, QR
  de cédula) se apoyan en `components/data/CameraScanner`.

## `services/`

- Un módulo por dominio (`roles.ts`, `usuarios.ts`, `conductores.ts`,
  `vehiculos.ts`, `parqueaderos.ts`, `celdas.ts`, `controlSalida.ts`,
  `reservas.ts`, `incidentes.ts`), cada uno exponiendo exactamente
  `getAll/getById/create/update/remove`, todos `async`.
- `movimientos.ts` es la excepción: no tiene CRUD propio porque es 100%
  derivado de `controlSalida` + `vehiculos` + `conductores` — solo expone
  `getBase()` (los registros de demo fijos); el cálculo derivado vive en
  `services/hooks/useMovimientos.ts`.
- `_db.ts` y `_crud.ts` (prefijo `_`) son el store interno en memoria y la
  fábrica de CRUD — **no se exportan fuera de `services/`**. Cada módulo de
  dominio es la única puerta de entrada a esos datos.
- **Solo `services/` puede importar el SDK de Firebase** (`firebase/*`).
  Hoy esa integración vive en `services/firebase.ts` y no está conectada a
  ningún flujo activo — login/registro/reset corren contra el mock de
  `services/auth.ts`. Forzado por `no-restricted-imports` en
  `eslint.config.js`.
- `services/hooks/` contiene los hooks de React Query (`useRoles`,
  `useConductores`, etc.), construidos sobre `createQueryHooks` de
  `_factory.ts`. Un dominio con lógica de invalidación de caché distinta a
  la genérica (p. ej. `useParqueaderos`, que también invalida `celdas` por
  la cascada de creación/borrado) exporta sus propios hooks en vez de usar
  la fábrica directamente.

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
  `services/_db.ts` (no hay Firebase que mockear — es mock por diseño, ver
  arriba), igual que corre la app real.

## Lint (`eslint.config.js`)

`npm run lint` corre `eslint-plugin-boundaries` (las reglas de esta página,
forzadas por herramienta) más `typescript-eslint` y `eslint-plugin-react-hooks`
recomendados. `@typescript-eslint/no-explicit-any` está en `warn` (no
`error`): hay deuda técnica preexistente de tipado en unos pocos puntos
(sobre todo retornos de librerías externas como Tesseract OCR); código
nuevo debería evitar `any`, pero no se bloquea CI por deuda ya existente
antes de instalar el linter.
