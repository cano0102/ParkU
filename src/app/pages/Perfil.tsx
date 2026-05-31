import React, { useState } from "react";

import {
  User,
  Mail,
  Phone,
  IdCard,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Sparkles,
  Lock,
  Clock3,
  MonitorSmartphone,
  BadgeCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

import { Badge } from "../components/ui/badge";

import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

export function Perfil() {
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const handlePasswordChange = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (
      passwordData.newPassword.length < 8
    ) {
      toast.error(
        "La contraseña debe tener mínimo 8 caracteres",
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error(
        "Las contraseñas no coinciden",
      );

      return;
    }

    toast.success(
      "Contraseña actualizada correctamente",
    );

    setDialogOpen(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-[#39A900] via-[#2F8F00] to-[#1F5F00] p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar + info */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-white/15 text-2xl sm:text-4xl font-black backdrop-blur">
              {user.nombre.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                Perfil institucional
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight truncate">
                {user.nombre}
              </h1>

              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-white/80 truncate">
                {user.correo}
              </p>

              <div className="mt-3 sm:mt-5 flex flex-wrap gap-2">
                <Badge className="border-white/20 bg-white/15 text-white text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.rol}
                </Badge>
                <Badge className="border-emerald-200/20 bg-emerald-500/20 text-white text-xs">
                  <BadgeCheck className="mr-1 h-3 w-3" />
                  Cuenta activa
                </Badge>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-4 lg:w-[360px] lg:grid-cols-2">
            {[
              { label: "Último acceso", value: "Hoy" },
              { label: "Sesiones",      value: "1"   },
              { label: "Estado",        value: "Activo" },
              { label: "Seguridad",     value: "100%" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/10 p-3 sm:p-5 backdrop-blur-xl">
                <div className="text-[10px] sm:text-xs uppercase tracking-wide text-white/70 leading-tight">
                  {label}
                </div>
                <div className="mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-black">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 xl:col-span-2">
          {/* INFO */}

          <Card className="overflow-hidden rounded-2xl sm:rounded-[30px] border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#39A900]/10">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#39A900]" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                    Información personal
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Datos principales del usuario.
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="grid grid-cols-1 gap-3 sm:gap-5 p-4 sm:p-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <User className="h-4 w-4" />
                  Nombre completo
                </div>

                <p className="text-lg font-black text-zinc-900">
                  {user.nombre}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Mail className="h-4 w-4" />
                  Correo electrónico
                </div>

                <p className="text-lg font-black text-zinc-900">
                  {user.correo}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </div>

                <p className="text-lg font-black text-zinc-900">
                  {user.telefono ||
                    "No registrado"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <IdCard className="h-4 w-4" />
                  Documento
                </div>

                <p className="text-lg font-black text-zinc-900">
                  {
                    user.tipoDocumento
                  }{" "}
                  {
                    user.identificacion
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Shield className="h-4 w-4" />
                  Rol dentro del sistema
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-zinc-900">
                    {user.rol}
                  </p>

                  <Badge className="border-[#39A900]/20 bg-[#39A900]/10 text-[#39A900]">
                    Permisos habilitados
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEGURIDAD */}

          <Card className="overflow-hidden rounded-2xl sm:rounded-[30px] border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#39A900]/10">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-[#39A900]" />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                      Seguridad
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Gestiona la seguridad de tu cuenta.
                    </p>
                  </div>
                </div>

                <Button
                  className="h-11 sm:h-12 w-full sm:w-auto rounded-2xl bg-[#39A900] px-5 sm:px-6 font-bold shadow-lg hover:bg-[#2D7D00] text-sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </div>
            </div>

            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Shield className="h-4 w-4 text-[#39A900]" />
                    Contraseña protegida
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    Última actualización:
                    hace 30 días
                  </p>
                </div>

                <div className="text-2xl tracking-[5px] text-zinc-400">
                  ••••••••
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOG */}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl overflow-hidden rounded-2xl sm:rounded-[32px] border-none bg-white p-0 shadow-2xl">
          {/* HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#39A900] via-[#2F8F00] to-[#1F5F00] px-5 sm:px-8 py-5 sm:py-7 text-white">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl sm:text-3xl font-black">
                  <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <Key className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>

                  <div>
                    Cambiar contraseña
                    <p className="mt-1 text-xs sm:text-sm font-medium text-white/80">
                      Actualiza la seguridad de tu cuenta institucional.
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="space-y-5 sm:space-y-7 p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* ACTUAL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Contraseña actual
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Ingrese contraseña actual"
                      className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/50 pl-11 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#39A900]/20"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                </div>

                {/* NUEVA */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Ingrese nueva contraseña"
                      className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/50 pl-11 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#39A900]/20"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                </div>

                {/* CONFIRMAR */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Confirme contraseña"
                      className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/50 pl-11 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#39A900]/20"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* VALIDACIONES */}
              <div className="rounded-2xl sm:rounded-[28px] border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 sm:p-5">
                <div className="mb-3 sm:mb-4 text-sm font-black text-zinc-900">
                  Requisitos de seguridad
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-medium ${passwordData.newPassword.length >= 8 ? "text-[#39A900]" : "text-zinc-500"}`}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? "text-[#39A900]" : "text-zinc-500"}`}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Las contraseñas coinciden
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-5 sm:px-8 py-4 sm:py-5 flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-12 flex-1 sm:flex-none rounded-2xl border-zinc-200 px-5 sm:px-6 font-semibold"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-11 sm:h-12 flex-1 sm:flex-none rounded-2xl bg-[#39A900] px-6 sm:px-8 font-bold shadow-lg hover:bg-[#2D7D00]"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}