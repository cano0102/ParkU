import React, { useState } from "react";
import { User, Mail, Phone, IdCard, Shield, Key, Save, CheckCircle2, Sparkles, Lock, Eye, EyeOff, Pencil, X, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function Perfil() {
  const { user, updateUser, changePassword } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ nombre: user?.nombre ?? "", numero: user?.numero ?? "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  if (!user) return null;

  const passwordLengthOk = passwordData.newPassword.length >= 8;
  const passwordsMatch = !!passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword;
  const currentFilled = passwordData.currentPassword.length > 0;
  const canSubmitPassword = passwordLengthOk && passwordsMatch && currentFilled;

  const handleSaveProfile = () => {
    if (!profileForm.nombre.trim()) return toast.error("El nombre no puede estar vacío");
    updateUser({ nombre: profileForm.nombre.trim(), numero: profileForm.numero.trim() });
    toast.success("Perfil actualizado");
    setEditMode(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFilled) return toast.error("Ingresa tu contraseña actual");
    if (!passwordLengthOk) return toast.error("Mínimo 8 caracteres");
    if (!passwordsMatch) return toast.error("Las contraseñas no coinciden");
    
    setSubmitting(true);
    try {
      const ok = changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (!ok) return toast.error("Contraseña actual incorrecta");
      toast.success("Contraseña actualizada");
      setDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#39A900] via-[#2F8F00] to-[#1F5F00] p-3 sm:p-4 md:p-5 text-white shadow">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full xs:w-auto">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 text-lg sm:text-xl md:text-2xl font-black backdrop-blur">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 xs:flex-none">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="text-[10px] sm:text-xs font-semibold">Perfil</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold leading-tight truncate text-white">{user.nombre}</p>
              <p className="text-xs sm:text-sm text-white/90 truncate">{user.correo}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full xs:w-auto mt-1 xs:mt-0">
            <Badge className="border-white/20 bg-white/15 text-white text-[9px] sm:text-[10px] md:text-xs py-0 h-4 sm:h-5 px-1.5 sm:px-2">
              <Shield className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
              {user.rol}
            </Badge>
            <Badge className="border-emerald-200/20 bg-emerald-500/20 text-white text-[9px] sm:text-[10px] md:text-xs py-0 h-4 sm:h-5 px-1.5 sm:px-2">
              <BadgeCheck className="mr-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5" />
              Activo
            </Badge>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <Card className="overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/50 px-3 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#39A900]" />
            <span className="text-xs sm:text-sm font-bold text-zinc-900">Información personal</span>
          </div>
          {!editMode ? (
            <Button variant="outline" size="sm" className="h-6 sm:h-7 rounded-lg border-zinc-200 px-2 sm:px-3 text-[10px] sm:text-xs text-zinc-700" onClick={() => { setProfileForm({ nombre: user.nombre, numero: user.numero }); setEditMode(true); }}>
              <Pencil className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-6 sm:h-7 w-6 sm:w-7 rounded-lg border-zinc-200 p-0 text-zinc-700" onClick={() => { setEditMode(false); setProfileForm({ nombre: user.nombre, numero: user.numero }); }}>
                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
              <Button size="sm" className="h-6 sm:h-7 rounded-lg bg-[#39A900] px-2 sm:px-3 text-[10px] sm:text-xs text-white hover:bg-[#2D7D00]" onClick={handleSaveProfile}>
                <Save className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Guardar
              </Button>
            </div>
          )}
        </div>
        <CardContent className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 p-2.5 sm:p-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-700">
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Nombre
            </div>
            {editMode ? (
              <Input 
                value={profileForm.nombre} 
                onChange={e => setProfileForm({ ...profileForm, nombre: e.target.value })} 
                className="mt-0.5 h-6 sm:h-7 rounded-lg border-zinc-200 bg-white text-xs sm:text-sm px-2 text-zinc-900" 
              />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{user.nombre}</p>
            )}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-700">
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Correo
            </div>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{user.correo}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-700">
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Teléfono
            </div>
            {editMode ? (
              <Input 
                value={profileForm.numero} 
                onChange={e => setProfileForm({ ...profileForm, numero: e.target.value })} 
                placeholder="Ej: 3001234567" 
                className="mt-0.5 h-6 sm:h-7 rounded-lg border-zinc-200 bg-white text-xs sm:text-sm px-2 text-zinc-900" 
              />
            ) : (
              <p className="text-xs sm:text-sm font-bold text-zinc-900">{user.numero || "—"}</p>
            )}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-700">
              <IdCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ID
            </div>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{user.id}</p>
          </div>
          <div className="col-span-1 xs:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 xs:gap-0">
              <div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-700">
                  <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Rol
                </div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900">{user.rol}</p>
              </div>
              <Badge className="border-[#39A900]/20 bg-[#39A900]/10 text-[#39A900] text-[9px] sm:text-[10px] py-0 h-4 sm:h-5 px-1.5 sm:px-2">
                Permisos ✓
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card className="overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/50 px-3 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#39A900]" />
            <span className="text-xs sm:text-sm font-bold text-zinc-900">Seguridad</span>
          </div>
          <Button className="h-6 sm:h-7 rounded-lg bg-[#39A900] px-2 sm:px-3 text-[10px] sm:text-xs font-bold text-white hover:bg-[#2D7D00]" onClick={() => setDialogOpen(true)}>
            <Key className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Cambiar
          </Button>
        </div>
        <CardContent className="p-2.5 sm:p-3">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-2.5">
            <div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-900">
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#39A900]" />
                Contraseña protegida
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-700">Cámbiala periódicamente</p>
            </div>
            <div className="text-sm sm:text-base tracking-[2px] sm:tracking-[3px] text-zinc-600">••••••••</div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[95%] sm:max-w-sm md:max-w-md overflow-hidden rounded-xl sm:rounded-2xl border-none bg-white p-0 shadow-2xl">
          <div className="bg-gradient-to-r from-[#39A900] via-[#2F8F00] to-[#1F5F00] px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg font-black text-white">
                <Key className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                Cambiar contraseña
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 p-3 sm:p-3.5 md:p-4">
              {[
                { label: "Actual", icon: Lock, show: showCurrent, setShow: setShowCurrent, value: passwordData.currentPassword, setValue: e => setPasswordData({ ...passwordData, currentPassword: e.target.value }) },
                { label: "Nueva", icon: Key, show: showNew, setShow: setShowNew, value: passwordData.newPassword, setValue: e => setPasswordData({ ...passwordData, newPassword: e.target.value }) }
              ].map(({ label, icon: Icon, show, setShow, value, setValue }) => (
                <div key={label} className="space-y-0.5 sm:space-y-1">
                  <Label className="text-[10px] sm:text-xs font-semibold text-zinc-800">{label}</Label>
                  <div className="relative">
                    <Icon className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-600" />
                    <Input 
                      type={show ? "text" : "password"} 
                      placeholder={`${label.toLowerCase()}`} 
                      className="h-7 sm:h-8 rounded-lg border-zinc-200 bg-zinc-50/50 pl-7 sm:pl-8 pr-7 sm:pr-8 text-xs sm:text-sm text-zinc-900" 
                      value={value} 
                      onChange={setValue} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShow(!show)} 
                      className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-zinc-600"
                    >
                      {show ? <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="space-y-0.5 sm:space-y-1">
                <Label className="text-[10px] sm:text-xs font-semibold text-zinc-800">Confirmar</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-600" />
                  <Input 
                    type={showNew ? "text" : "password"} 
                    placeholder="confirmar" 
                    className="h-7 sm:h-8 rounded-lg border-zinc-200 bg-zinc-50/50 pl-7 sm:pl-8 text-xs sm:text-sm text-zinc-900" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                  />
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 sm:p-2.5">
                <div className="space-y-1 text-[10px] sm:text-xs">
                  {[
                    { label: "Actual ingresada", check: currentFilled },
                    { label: "Mínimo 8 caracteres", check: passwordLengthOk },
                    { label: "Coinciden", check: passwordsMatch }
                  ].map(({ label, check }) => (
                    <div key={label} className={`flex items-center gap-1 font-medium ${check ? "text-[#39A900]" : "text-zinc-600"}`}>
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 flex-row gap-1.5 sm:gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="h-7 sm:h-8 flex-1 rounded-lg border-zinc-200 text-[10px] sm:text-xs text-zinc-700" 
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!canSubmitPassword || submitting} 
                className="h-7 sm:h-8 flex-1 rounded-lg bg-[#39A900] text-[10px] sm:text-xs font-bold text-white hover:bg-[#2D7D00] disabled:opacity-50"
              >
                <Save className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {submitting ? "..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}