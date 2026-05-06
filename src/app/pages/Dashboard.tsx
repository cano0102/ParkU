import React from 'react';
import { Car, ParkingCircle, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useData } from '../context/DataContext';
import { Progress } from '../components/ui/progress';

export function Dashboard() {
  const { parqueaderos, celdas, vehiculos, conductores, controlesSalida } = useData();

  // Calcular estadísticas
  const totalCeldas = celdas.length;
  const celdasOcupadas = celdas.filter(c => c.estado === 'ocupada').length;
  const celdasDisponibles = celdas.filter(c => c.estado === 'disponible').length;
  const celdasReservadas = celdas.filter(c => c.estado === 'reservada').length;
  const celdasMantenimiento = celdas.filter(c => c.estado === 'mantenimiento').length;
  
  const ocupacionPorcentaje = totalCeldas > 0 ? (celdasOcupadas / totalCeldas) * 100 : 0;
  
  // Estadísticas por tipo de vehículo
  const celdasCarros = celdas.filter(c => c.tipo === 'carro');
  const celdasMotos = celdas.filter(c => c.tipo === 'moto');
  const celdasMovilidadReducida = celdas.filter(c => c.tipo === 'movilidad reducida');
  
  const carrosOcupados = celdasCarros.filter(c => c.estado === 'ocupada').length;
  const motosOcupadas = celdasMotos.filter(c => c.estado === 'ocupada').length;
  const movilidadOcupada = celdasMovilidadReducida.filter(c => c.estado === 'ocupada').length;
  
  const ocupacionCarros = celdasCarros.length > 0 ? (carrosOcupados / celdasCarros.length) * 100 : 0;
  const ocupacionMotos = celdasMotos.length > 0 ? (motosOcupadas / celdasMotos.length) * 100 : 0;
  const ocupacionMovilidad = celdasMovilidadReducida.length > 0 ? (movilidadOcupada / celdasMovilidadReducida.length) * 100 : 0;

  const vehiculosEnParqueadero = controlesSalida.filter(c => c.estado === 'en_parqueadero').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vista general del sistema de parqueadero</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Celdas Totales
            </CardTitle>
            <ParkingCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCeldas}</div>
            <p className="text-xs text-gray-500 mt-1">
              En {parqueaderos.length} parqueaderos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ocupación Actual
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{celdasOcupadas}</div>
            <p className="text-xs text-gray-500 mt-1">
              {ocupacionPorcentaje.toFixed(1)}% de ocupación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vehículos Registrados
            </CardTitle>
            <Car className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{vehiculos.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {vehiculosEnParqueadero} en parqueadero
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conductores Activos
            </CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{conductores.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del Parqueadero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Parqueadero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ocupación General</span>
                <span className="text-sm font-bold text-gray-900">{ocupacionPorcentaje.toFixed(1)}%</span>
              </div>
              <Progress value={ocupacionPorcentaje} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{celdasDisponibles}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Ocupadas</p>
                <p className="text-2xl font-bold text-blue-600">{celdasOcupadas}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Reservadas</p>
                <p className="text-2xl font-bold text-yellow-600">{celdasReservadas}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Mantenimiento</p>
                <p className="text-2xl font-bold text-red-600">{celdasMantenimiento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupación por Tipo de Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Carros</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {carrosOcupados}/{celdasCarros.length}
                </span>
              </div>
              <Progress value={ocupacionCarros} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{ocupacionCarros.toFixed(1)}% ocupado</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Motos</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {motosOcupadas}/{celdasMotos.length}
                </span>
              </div>
              <Progress value={ocupacionMotos} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{ocupacionMotos.toFixed(1)}% ocupado</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Movilidad Reducida</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {movilidadOcupada}/{celdasMovilidadReducida.length}
                </span>
              </div>
              <Progress value={ocupacionMovilidad} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{ocupacionMovilidad.toFixed(1)}% ocupado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parqueaderos */}
      <Card>
        <CardHeader>
          <CardTitle>Parqueaderos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parqueaderos.filter(p => p.estado === 'activo').map((parqueadero) => {
              const celdasParqueadero = celdas.filter(c => c.parqueaderoId === parqueadero.id);
              const ocupadasParqueadero = celdasParqueadero.filter(c => c.estado === 'ocupada').length;
              const ocupacionParq = celdasParqueadero.length > 0 
                ? (ocupadasParqueadero / celdasParqueadero.length) * 100 
                : 0;

              return (
                <div key={parqueadero.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{parqueadero.nombre}</h3>
                      <p className="text-sm text-gray-500">{parqueadero.direccion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {ocupadasParqueadero}/{celdasParqueadero.length}
                      </p>
                      <p className="text-xs text-gray-500">celdas ocupadas</p>
                    </div>
                  </div>
                  <Progress value={ocupacionParq} className="h-2" />
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Horario: {parqueadero.horaInicio} - {parqueadero.horaFin}</span>
                    <span>{ocupacionParq.toFixed(1)}% ocupado</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
