# 🚗 ParkU — Sistema Inteligente de Gestión de Parqueaderos

Sistema web desarrollado para el **Complejo Central del SENA Regional Antioquia**, orientado a la automatización y gestión inteligente de parqueaderos institucionales mediante control digital de acceso, administración de celdas, reservas y monitoreo en tiempo real.

---

# 📌 Información General

| Campo | Información |
|---|---|
| Nombre del Proyecto | ParkU |
| Programa | Tecnología en Análisis y Desarrollo de Software |
| Centro de Formación | Centro de Servicios y Gestión Empresarial |
| Regional | Antioquia |
| Sector | Economía Popular |
| Cliente | SENA - Centro de Servicios y Gestión Empresarial |
| Inicio | Septiembre 2025 |
| Finalización | Octubre 2026 |

---

# 🧠 Descripción del Proyecto

ParkU nace como solución a las problemáticas actuales del sistema manual de control de parqueaderos implementado en el Complejo Central del SENA Regional Antioquia. Actualmente, el registro de vehículos, asignación de espacios y control de ingreso/salida se realiza mediante planillas físicas administradas por el personal de vigilancia, generando:

- Congestión vehicular
- Sobreocupación de celdas
- Pérdida de información
- Errores manuales
- Dificultades en la trazabilidad
- Ineficiencia operativa
- Uso indebido de espacios reservados

El sistema permitirá automatizar completamente la operación de los parqueaderos institucionales mediante una plataforma web y móvil con monitoreo en tiempo real.

---

# 🎯 Objetivo General

Desarrollar una aplicación web/móvil que gestione los procesos de parqueaderos, celdas, control de ingresos, control de salida, reservas, seguridad y novedades de acuerdo con las necesidades del Complejo Central del SENA Regional Antioquia.

---

# ✅ Objetivos Específicos

- Gestionar perfiles y permisos
- Administrar usuarios
- Gestionar parqueaderos y celdas
- Controlar ocupación de espacios
- Gestionar reservas
- Gestionar control de ingreso y salida
- Gestionar reconocimiento de placas
- Administrar incidentes y novedades
- Generar métricas y reportes operativos
- Optimizar la asignación de espacios

---

# 🚀 Funcionalidades Principales

## 🔐 Gestión de Usuarios
- Inicio de sesión
- Recuperación de contraseña
- Gestión de roles y permisos
- Validación institucional

## 🅿️ Gestión de Parqueaderos
- CRUD de parqueaderos
- Activación/Inactivación
- Distribución de celdas
- Gestión por zonas

## 🪑 Gestión Inteligente de Celdas
- Visualización tipo cine
- Control de ocupación
- Disponibilidad en tiempo real
- Reserva interactiva
- Asignación automática

## 🚗 Gestión Vehicular
- Registro de vehículos
- Gestión de conductores
- Reconocimiento de placas
- Historial de accesos

## 📊 Dashboard Administrativo
- Estadísticas de ocupación
- Reportes diarios
- Historial de ingresos y salidas
- Indicadores operativos

## ⚠️ Seguridad y Novedades
- Registro de incidentes
- Gestión de novedades
- Alertas operativas

---

# 🎬 Sistema de Reserva Tipo Cine

ParkU implementa un sistema visual de ocupación inspirado en las plataformas de reserva de asientos de cine.

Cada celda posee un estado visual:

| Estado | Color |
|---|---|
| Disponible | Gris |
| Ocupada | Rojo |
| Seleccionada | Verde |
| Reservada | Azul |

Esto permite:

- Mejor experiencia de usuario
- Visualización rápida de disponibilidad
- Reducción de congestión
- Gestión intuitiva del parqueadero

---

# 🛠 Tecnologías Utilizadas

## Frontend
- React
- TypeScript
- TailwindCSS
- Shadcn/UI
- React Router DOM
- Lucide React
- Sonner

## Backend
- Node.js
- Express.js

## Base de Datos
- PostgreSQL / MySQL

## Herramientas
- Git
- GitHub
- Figma
- Balsamiq

---

# 🧱 Arquitectura del Proyecto

Arquitectura **feature-based** (organizada por dominio de negocio, no por tipo de archivo). Cada módulo de negocio vive de forma aislada en `features/`, y todo lo transversal/reutilizable vive en `shared/`.

```bash
src/
│
├── app/                      # Composition root: arranque de la app
│   ├── App.tsx                #   providers + router
│   └── routes.tsx             #   definición de rutas
│
├── features/                 # Un folder por dominio de negocio
│   ├── auth/pages/             # Login, ForgotPassword, ResetPassword
│   ├── landing/pages/
│   ├── dashboard/pages/
│   ├── roles/pages/
│   ├── usuarios/pages/
│   ├── conductores/pages/
│   ├── vehiculos/pages/
│   ├── parqueaderos/pages/
│   ├── celdas/pages/
│   ├── asignaciones/pages/
│   ├── control-salida/pages/
│   ├── reservas/pages/
│   ├── incidentes/pages/
│   └── perfil/pages/
│
├── shared/                   # Reutilizable / transversal a toda la app
│   ├── components/ui/          # Componentes shadcn/ui (Button, Card, Dialog...)
│   ├── components/figma/       # Helpers de assets de Figma
│   ├── components/              # ProtectedRoute, etc.
│   ├── layouts/                # MainLayout (sidebar + shell de /app)
│   └── pages/                  # NotFound
│
├── context/                  # Estado global (candidato a dividirse por dominio)
│   ├── AuthContext.tsx
│   └── DataContext.tsx
│
├── firebase/                 # Configuración de Firebase
├── styles/                   # CSS global, tema, overrides
└── main.tsx
```

**Convenciones:**
- Cada página en `features/<dominio>/pages/` solo debería orquestar UI + estado de ese dominio. La lógica de negocio pesada y los componentes reutilizables de un dominio deberían moverse a `features/<dominio>/components/` y `features/<dominio>/hooks/` a medida que se refactoricen (actualmente el código de cada página sigue siendo monolítico — ver "Próximos pasos" abajo).
- Alias `@/*` disponible (ver `tsconfig.json` / `vite.config.ts`) apuntando a `src/*`, para evitar imports relativos largos (`../../../`) en código nuevo.
- `DataContext.tsx` sigue siendo un god-context con todos los tipos y estado de todos los dominios. Es el siguiente candidato a dividirse en contexts/hooks por dominio (`useUsuarios`, `useCeldas`, etc.) sin romper los consumidores actuales.

**Próximos pasos recomendados (no incluidos en este cambio para no romper nada de golpe):**
1. Dividir `DataContext.tsx` en tipos (`features/<dominio>/types.ts`) y estado por dominio.
2. Extraer los datos mock a `features/<dominio>/services/` (patrón repositorio) para poder cambiar a una API real sin tocar las páginas.
3. Partir cada página grande en `components/` (UI) + `hooks/` (lógica) dentro de su feature.
4. Lazy-load de rutas (`React.lazy`) para reducir el bundle de 1.3MB que reporta el build.

---

# 📦 Instalación del Proyecto

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/usuario/parku.git
```

---

## 2️⃣ Entrar al proyecto

```bash
cd parku
```

---

## 3️⃣ Instalar dependencias

```bash
npm install
```

---

## 4️⃣ Ejecutar proyecto

```bash
npm run dev
```

Servidor local:

```bash
http://localhost:5173
```

---

# ⚙️ Variables de Entorno

Crear archivo `.env`

```env
VITE_APP_NAME=ParkU
VITE_API_URL=http://localhost:3000
```

---

# 📱 Alcance del Proyecto

El sistema contempla:

- Aplicación web responsive
- Módulo móvil
- Gestión administrativa
- Gestión de reservas
- Monitoreo de ocupación
- Control de acceso
- Dashboard analítico
- Gestión de seguridad
- Manual técnico y usuario

---

# 🧩 Procesos del Sistema

## Configuración
- Roles
- Permisos

## Usuarios
- Gestión de usuarios
- Gestión de acceso

## Parqueaderos y Celdas
- Gestión de parqueaderos
- Gestión de celdas
- Control de ocupación

## Ingreso y Salida
- Conductores
- Vehículos
- Asignación de celdas
- Control de acceso

## Reservas
- Vehículos institucionales
- Visitantes
- Movilidad reducida

## Seguridad
- Incidentes
- Reconocimiento de placas

## Medición y Desempeño
- Dashboard
- Reportes
- Estadísticas

---

# 🎯 Beneficios Esperados

## Para Usuarios
- Menor tiempo de espera
- Mejor experiencia de acceso
- Mayor seguridad
- Transparencia en disponibilidad

## Para Vigilancia
- Reducción de carga operativa
- Automatización de registros
- Mayor control

## Para la Institución
- Optimización del espacio
- Trazabilidad completa
- Datos en tiempo real
- Toma de decisiones estratégicas

---

# 📸 Capturas del Sistema

## Vista tipo cine
- Reserva interactiva de celdas
- Visualización de ocupación
- Gestión visual de disponibilidad

## Dashboard
- Indicadores operativos
- Reportes
- Estadísticas en tiempo real

---

# 🧪 Metodología de Desarrollo

El proyecto se desarrolla bajo metodología ágil SCRUM:

| Sprint | Entregable |
|---|---|
| Sprint 01 | Recolección de información |
| Sprint 02 | Ficha de proyecto |
| Sprint 03 | Historias de usuario |
| Sprint 04 | Backlog refinado |
| Sprint 05 | Diagramas UML |
| Sprint 06 | Story Mapping |
| Sprint 07 | Prototipo UI |
| Sprint 08 | Base de datos |
| Sprint 09 | Diagramas técnicos |
| Sprint 10 | Desarrollo |
| Sprint 11 | Implantación |

---

# 👥 Equipo de Desarrollo

| Nombre | Rol |
|---|---|
| Mateo Bejarano Mejía | Desarrollador |
| Valery Restrepo Álvarez | Desarrolladora |
| Brandon Alexis Quintero Álvarez | Desarrollador |
| Steven Tobón Londoño | Desarrollador |
| Anderson Alonso Arboleda Cano | Desarrollador |

---

# 🏫 Entidad Asociada

**SENA — Servicio Nacional de Aprendizaje**  
Centro de Servicios y Gestión Empresarial  
Regional Antioquia

---

# 📄 Licencia

Proyecto académico desarrollado para fines formativos bajo el programa ADSO del SENA.

---

# 📌 Estado del Proyecto

🚧 En desarrollo — Fase de análisis y construcción.