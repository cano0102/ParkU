import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Usuario } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, roles } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombre: '',
    numero: '',
    rol: '',
    tipoDocumento: 'CC',
    identificacion: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        correo: usuario.correo,
        password: usuario.password,
        nombre: usuario.nombre,
        numero: usuario.numero,
        rol: usuario.rol,
        tipoDocumento: usuario.tipoDocumento,
        identificacion: usuario.identificacion,
        estado: usuario.estado
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        correo: '',
        password: '',
        nombre: '',
        numero: '',
        rol: '',
        tipoDocumento: 'CC',
        identificacion: '',
        estado: 'activo'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUsuario) {
      updateUsuario(editingUsuario.id, formData);
      toast.success('Usuario actualizado exitosamente');
    } else {
      addUsuario(formData);
      toast.success('Usuario creado exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUsuario(id);
      toast.success('Usuario eliminado exitosamente');
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    updateUsuario(id, { estado: nuevoEstado });
    toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const handleViewUsuario = (usuario: Usuario) => {
    setViewingUsuario(usuario);
    setViewDialogOpen(true);
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.identificacion.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, correo o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({filteredUsuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm">{usuario.tipoDocumento}</p>
                        <p className="text-sm text-gray-900">{usuario.identificacion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <span>{usuario.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{usuario.numero}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{usuario.rol}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={usuario.estado === 'activo'}
                        onCheckedChange={(checked) => 
                          handleChangeEstado(usuario.id, checked ? 'activo' : 'inactivo')
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsuario(usuario)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(usuario)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PA">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identificacion">Identificación</Label>
                <Input
                  id="identificacion"
                  value={formData.identificacion}
                  onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUsuario}
                  placeholder={editingUsuario ? '(sin cambios)' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número de Teléfono</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) => setFormData({ ...formData, rol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id} value={rol.nombre}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.estado === 'activo'}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, estado: checked ? 'activo' : 'inactivo' })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingUsuario ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Usuario</DialogTitle>
          </DialogHeader>
          {viewingUsuario && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{viewingUsuario.nombre}</h3>
                  <Badge variant={viewingUsuario.estado === 'activo' ? 'default' : 'secondary'}>
                    {viewingUsuario.estado}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Tipo de Documento</Label>
                  <p className="text-gray-900 font-medium">{viewingUsuario.tipoDocumento}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Identificación</Label>
                  <p className="text-gray-900 font-medium">{viewingUsuario.identificacion}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Correo</Label>
                  <p className="text-gray-900">{viewingUsuario.correo}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Teléfono</Label>
                  <p className="text-gray-900">{viewingUsuario.numero}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Rol</Label>
                  <p className="text-gray-900">{viewingUsuario.rol}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
