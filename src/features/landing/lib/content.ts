import {
  ShieldCheck,
  BarChart3,
  ScanLine,
  Activity,
  Clock,
  Users,
  Sparkles,
  UserPlus,
  DoorOpen,
} from "lucide-react";

export const features = [
  {
    icon: ShieldCheck,
    title: "Seguridad Institucional",
    desc: "Control automatizado de acceso vehicular.",
  },
  {
    icon: ScanLine,
    title: "Lectura Inteligente",
    desc: "Ingreso mediante reconocimiento de placas.",
  },
  {
    icon: Activity,
    title: "Monitoreo en Tiempo Real",
    desc: "Visualización del estado del parqueadero.",
  },
  {
    icon: BarChart3,
    title: "Analítica Operativa",
    desc: "Estadísticas y reportes institucionales.",
  },
];

export const steps = [
  {
    icon: UserPlus,
    title: "Regístrate",
    desc: "Crea tu cuenta institucional con tus datos del SENA en pocos minutos.",
  },
  {
    icon: DoorOpen,
    title: "Accede sin filas",
    desc: "Ingresa y sal del parqueadero de forma automática, rápida y segura.",
  },
];

export const heroStats = [
  { label: "Disponibles", value: 124 },
  { label: "Ocupados", value: 98 },
  { label: "Reservas", value: 27 },
  { label: "Accesos", value: 1240 },
];

export const trustBadges = [
  { icon: Clock, text: "Disponible 24/7" },
  { icon: Users, text: "+500 usuarios activos" },
  { icon: Sparkles, text: "Soporte institucional SENA" },
];

export const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "beneficios", label: "Beneficios" },
  { id: "como-funciona", label: "Cómo Funciona" },
  { id: "contacto", label: "Contacto" },
];
