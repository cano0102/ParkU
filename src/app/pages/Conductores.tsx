import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, UserCog, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Conductor } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';

export function Conductores() {
  const {
    conductores,
    addConductor,
    updateConductor,
    deleteConductor,
    usuarios,
    vehiculos,
    addVehiculo
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    usuarioId: '',
    tipoConductor: 'aprendiz' as 'aprendiz' | 'instructor',
    centroFormacion: '',
    discapacidad: false,
    tipoDiscapacidad: '',
    estado: 'activo' as 'activo' | 'inactivo',

    // VEHÍCULO
    placa: '',
    tipoVehiculo: 'carro' as 'carro' | 'moto',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    color: '',
    descripcion: ''
  });

  const handleOpenDialog = (conductor?: Conductor) => {
    if (conductor) {
      setEditingConductor(conductor);

      const vehiculo = vehiculos.find(v => v.conductorId === conductor.id);

      setFormData({
        usuarioId: conductor.usuarioId,
        tipoConductor: conductor.tipoConductor,
        centroFormacion: conductor.centroFormacion,
        discapacidad: conductor.discapacidad,
        tipoDiscapacidad: conductor.tipoDiscapacidad || '',
        estado: conductor.estado,

        placa: vehiculo?.placa || '',
        tipoVehiculo: vehiculo?.tipo || 'carro',
        marca: vehiculo?.marca || '',
        modelo: vehiculo?.modelo || '',
        año: vehiculo?.año || new Date().getFullYear(),
        color: vehiculo?.color || '',
        descripcion: vehiculo?.descripcion || ''
      });
    } else {
      setEditingConductor(null);

      setFormData({
        usuarioId: '',
        tipoConductor: 'aprendiz',
        centroFormacion: '',
        discapacidad: false,
        tipoDiscapacidad: '',
        estado: 'activo',

        placa: '',
        tipoVehiculo: 'carro',
        marca: '',
        modelo: '',
        año: new Date().getFullYear(),
        color: '',
        descripcion: ''
      });
    }

    setDialogOpen(true);
  };

  const handleChangeEstado = (
    id: string,
    nuevoEstado: 'activo' | 'inactivo'
  ) => {
    updateConductor(id, { estado: nuevoEstado });

    toast.success(
      `Conductor ${
        nuevoEstado === 'activo' ? 'activado' : 'desactivado'
      } correctamente`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const conductorData = {
      usuarioId: formData.usuarioId,
      tipoConductor: formData.tipoConductor,
      centroFormacion: formData.centroFormacion,
      discapacidad: formData.discapacidad,
      tipoDiscapacidad: formData.tipoDiscapacidad,
      estado: formData.estado
    };

    if (editingConductor) {
      updateConductor(editingConductor.id, conductorData);

      const vehiculoExistente = vehiculos.find(
        v => v.conductorId === editingConductor.id
      );

      if (vehiculoExistente) {
        // actualizar vehículo
      }

      toast.success('Conductor actualizado exitosamente');
    } else {
      addConductor(conductorData);

      const nuevoConductor = conductores[conductores.length - 1];

      addVehiculo({
        conductorId: nuevoConductor?.id || '',
        placa: formData.placa,
        tipo: formData.tipoVehiculo,
        marca: formData.marca,
        modelo: formData.modelo,
        año: formData.año,
        color: formData.color,
        descripcion: formData.descripcion,
        estado: 'activo'
      });

      toast.success('Conductor y vehículo creados exitosamente');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este conductor?')) {
      deleteConductor(id);
      toast.success('Conductor eliminado exitosamente');
    }
  };

  const handleViewConductor = (conductor: Conductor) => {
    setViewingConductor(conductor);
    setViewDialogOpen(true);
  };

  const getUsuario = (usuarioId: string) => {
    return usuarios.find(u => u.id === usuarioId);
  };

  const getVehiculosConductor = (conductorId: string) => {
    return vehiculos.filter(v => v.conductorId === conductorId);
  };

  const filteredConductores = conductores.filter(conductor => {
    const usuario = getUsuario(conductor.usuarioId);

    if (!usuario) return false;

    return (
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.identificacion.includes(searchTerm) ||
      conductor.centroFormacion
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Conductores
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra los conductores y vehículos
          </p>
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conductor
        </Button>
      </div>

      {/* BÚSQUEDA */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input
              placeholder="Buscar conductor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Conductores ({filteredConductores.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Vehículos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredConductores.map(conductor => {
                  const usuario = getUsuario(conductor.usuarioId);

                  const vehiculosConductor =
                    getVehiculosConductor(conductor.id);

                  if (!usuario) return null;

                  return (
                    <TableRow key={conductor.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {usuario.tipoDocumento}
                          </p>

                          <p className="font-medium">
                            {usuario.identificacion}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCog className="h-5 w-5 text-blue-600" />
                          </div>

                          <div>
                            <p className="font-medium">
                              {usuario.nombre}
                            </p>

                            <p className="text-xs text-gray-500">
                              {usuario.correo}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            conductor.tipoConductor === 'instructor'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {conductor.tipoConductor}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {conductor.centroFormacion}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {vehiculosConductor.length}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={conductor.estado === 'activo'}
                          onCheckedChange={checked =>
                            handleChangeEstado(
                              conductor.id,
                              checked ? 'activo' : 'inactivo'
                            )
                          }
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewConductor(conductor)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenDialog(conductor)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() =>
                              handleDelete(conductor.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingConductor
                ? 'Editar Conductor'
                : 'Nuevo Conductor'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">

              {/* USUARIO */}
              <div className="space-y-2 col-span-2">
                <Label>Usuario</Label>

                <Select
                  value={formData.usuarioId}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      usuarioId: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>

                  <SelectContent>
                    {usuarios.map(usuario => (
                      <SelectItem
                        key={usuario.id}
                        value={usuario.id}
                      >
                        {usuario.nombre} -{' '}
                        {usuario.identificacion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TIPO */}
              <div className="space-y-2">
                <Label>Tipo Conductor</Label>

                <Select
                  value={formData.tipoConductor}
                  onValueChange={(
                    value: 'aprendiz' | 'instructor'
                  ) =>
                    setFormData({
                      ...formData,
                      tipoConductor: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="aprendiz">
                      Aprendiz
                    </SelectItem>

                    <SelectItem value="instructor">
                      Instructor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CENTRO */}
              <div className="space-y-2">
                <Label>Centro Formación</Label>

                <Input
                  value={formData.centroFormacion}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      centroFormacion: e.target.value
                    })
                  }
                />
              </div>

              {/* DISCAPACIDAD */}
              <div className="space-y-2 col-span-2">
                <Label>¿Tiene discapacidad?</Label>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.discapacidad}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        discapacidad: checked
                      })
                    }
                  />

                  <span>
                    {formData.discapacidad ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              {formData.discapacidad && (
                <div className="space-y-2 col-span-2">
                  <Label>Tipo discapacidad</Label>

                  <Textarea
                    value={formData.tipoDiscapacidad}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        tipoDiscapacidad: e.target.value
                      })
                    }
                  />
                </div>
              )}

              {/* VEHÍCULO */}
              <div className="col-span-2 mt-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Datos del Vehículo
                </h3>
              </div>

              <div className="space-y-2">
                <Label>Placa</Label>

                <Input
                  value={formData.placa}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      placa: e.target.value.toUpperCase()
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo Vehículo</Label>

                <Select
                  value={formData.tipoVehiculo}
                  onValueChange={(
                    value: 'carro' | 'moto'
                  ) =>
                    setFormData({
                      ...formData,
                      tipoVehiculo: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="carro">
                      Carro
                    </SelectItem>

                    <SelectItem value="moto">
                      Moto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marca</Label>

                <Input
                  value={formData.marca}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      marca: e.target.value
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo</Label>

                <Input
                  value={formData.modelo}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      modelo: e.target.value
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Año</Label>

                <Input
                  type="number"
                  value={formData.año}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      año: parseInt(e.target.value)
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>

                <Input
                  value={formData.color}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      color: e.target.value
                    })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Descripción</Label>

                <Textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      descripcion: e.target.value
                    })
                  }
                />
              </div>

              {/* ESTADO */}
              <div className="space-y-2 col-span-2">
                <Label>Estado</Label>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.estado === 'activo'}
                    onCheckedChange={checked =>
                      setFormData({
                        ...formData,
                        estado: checked
                          ? 'activo'
                          : 'inactivo'
                      })
                    }
                  />

                  <span>
                    {formData.estado}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                {editingConductor
                  ? 'Actualizar'
                  : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}