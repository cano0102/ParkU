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

import { Card, CardContent } from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
    <div className="space-y-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-4xl font-black backdrop-blur">
              {user.nombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Perfil del usuario
              </div>

              <h1 className="text-4xl font-black leading-none">
                {user.nombre}
              </h1>

              <p className="mt-3 text-white/80">
                {user.correo}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="border-white/20 bg-white/15 text-white">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.rol}
                </Badge>

                <Badge className="border-emerald-200/20 bg-emerald-500/20 text-white">
                  <BadgeCheck className="mr-1 h-3 w-3" />
                  Cuenta activa
                </Badge>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Último acceso
              </div>

              <div className="mt-1 text-2xl font-black">
                Hoy
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Sesiones
              </div>

              <div className="mt-1 text-2xl font-black">
                1
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Estado
              </div>

              <div className="mt-1 text-2xl font-black">
                Activo
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Seguridad
              </div>

              <div className="mt-1 text-2xl font-black">
                100%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 xl:col-span-2">
          {/* INFO */}

          <Card className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
            <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39A900]/10">
                  <User className="h-6 w-6 text-[#39A900]" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-zinc-900">
                    Información personal
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Datos principales del
                    usuario.
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <User className="h-4 w-4" />
                  Nombre completo
                </div>

                <p className="text-lg font-bold text-zinc-900">
                  {user.nombre}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Mail className="h-4 w-4" />
                  Correo electrónico
                </div>

                <p className="text-lg font-bold text-zinc-900">
                  {user.correo}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </div>

                <p className="text-lg font-bold text-zinc-900">
                  {user.telefono ||
                    "No registrado"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <IdCard className="h-4 w-4" />
                  Documento
                </div>

                <p className="text-lg font-bold text-zinc-900">
                  {
                    user.tipoDocumento
                  }{" "}
                  {
                    user.identificacion
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                  <Shield className="h-4 w-4" />
                  Rol dentro del sistema
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-zinc-900">
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

          <Card className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
            <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39A900]/10">
                    <Lock className="h-6 w-6 text-[#39A900]" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-zinc-900">
                      Seguridad
                    </h2>

                    <p className="text-sm text-zinc-500">
                      Gestiona la seguridad
                      de tu cuenta.
                    </p>
                  </div>
                </div>

                <Button
                  className="rounded-xl bg-[#39A900] hover:bg-[#2D7D00]"
                  onClick={() =>
                    setDialogOpen(true)
                  }
                >
                  <Key className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </div>
            </div>

            <CardContent className="space-y-4 p-6">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Seguridad alta
                  </div>

                  <p className="mt-2 text-sm text-emerald-600">
                    Tu cuenta cumple los
                    estándares de seguridad.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <MonitorSmartphone className="h-4 w-4" />
                    Sesión activa
                  </div>

                  <p className="mt-2 text-sm text-blue-600">
                    Navegador actual
                    conectado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
            <div className="bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-6 text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <Shield className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-3xl font-black">
                {user.rol}
              </h2>

              <p className="mt-2 text-sm text-white/80">
                Acceso institucional
                habilitado.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span>
                    Nivel de acceso
                  </span>

                  <span className="font-bold">
                    100%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-full rounded-full bg-white" />
                </div>
              </div>
            </div>

            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Estado
                  </div>

                  <div className="mt-1 text-sm font-bold text-zinc-900">
                    Operativo
                  </div>
                </div>

                <div className="h-3 w-3 rounded-full bg-[#39A900]" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Último acceso
                  </div>

                  <div className="mt-1 text-sm font-bold text-zinc-900">
                    Hoy 10:30 AM
                  </div>
                </div>

                <Clock3 className="h-5 w-5 text-zinc-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h3 className="text-lg font-black text-zinc-900">
                Actividad reciente
              </h3>
            </div>

            <CardContent className="space-y-4 p-5">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  Inicio de sesión
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Acceso exitoso desde
                  Chrome.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  Contraseña actualizada
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Hace 30 días.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  Cuenta verificada
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Perfil institucional
                  validado.
                </p>
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
        <DialogContent className="max-w-xl overflow-hidden rounded-3xl border-none bg-white p-0">
          <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                <Key className="h-5 w-5" />
                Cambiar contraseña
              </DialogTitle>

              <DialogDescription className="text-white/80">
                Actualiza la seguridad de
                tu cuenta institucional.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handlePasswordChange}
          >
            <div className="space-y-5 p-6">
              <div>
                <Label>
                  Contraseña actual
                </Label>

                <Input
                  type="password"
                  className="mt-2 h-11 rounded-xl border-zinc-200"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Nueva contraseña
                </Label>

                <Input
                  type="password"
                  className="mt-2 h-11 rounded-xl border-zinc-200"
                  value={
                    passwordData.newPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Confirmar contraseña
                </Label>

                <Input
                  type="password"
                  className="mt-2 h-11 rounded-xl border-zinc-200"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* VALIDACIONES */}

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-3 text-sm font-bold text-zinc-900">
                  Requisitos
                </div>

                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      passwordData
                        .newPassword
                        .length >= 8
                        ? "text-[#39A900]"
                        : "text-zinc-500"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mínimo 8 caracteres
                  </div>

                  <div
                    className={`flex items-center gap-2 text-sm ${
                      passwordData
                        .newPassword ===
                        passwordData.confirmPassword &&
                      passwordData
                        .newPassword
                        ? "text-[#39A900]"
                        : "text-zinc-500"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Las contraseñas
                    coinciden
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-200"
                onClick={() =>
                  setDialogOpen(false)
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00]"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}