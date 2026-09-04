import { motion } from "framer-motion";
import {
  IconCalendarMonth as CalendarDays,
  IconClockHour3 as Clock3,
  IconLayoutDashboard as LayoutDashboard,
} from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { formatClock, formatDate } from "../lib/helpers";
import { fadeUp } from "./DashboardPrimitives";

interface DashboardHeaderProps {
  now: Date;
}

/** Banner superior del Dashboard: logo, título y reloj institucional. */
export function DashboardHeader({ now }: DashboardHeaderProps) {
  return (
    <motion.header
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[20px] p-6 sm:p-7 text-white shadow-[0_10px_28px_rgba(45,125,0,0.22)]"
      style={{ background: "linear-gradient(135deg, #39A900 0%, #2D7D00 100%)" }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/[0.07]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/[0.05]" />

      <div className="relative z-[1] flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md">
            <img src={logoSena} alt="SENA" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              <LayoutDashboard size={11} /> Panel general
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">ParkU · SENA</h1>
            <p className="text-sm text-white/75 mt-0.5">Control y monitoreo de parqueaderos institucionales</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5">
            <CalendarDays size={16} />
            <span className="text-sm font-medium capitalize">{formatDate(now)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5">
            <Clock3 size={16} />
            <span className="text-sm font-mono font-bold">{formatClock(now)}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
