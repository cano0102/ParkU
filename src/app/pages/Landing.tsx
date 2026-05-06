import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Car, Shield, Clock, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Landing() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Control total del acceso vehicular al campus universitario'
    },
    {
      icon: Clock,
      title: 'Gestión en Tiempo Real',
      description: 'Monitoreo instantáneo de disponibilidad y ocupación'
    },
    {
      icon: Smartphone,
      title: 'Fácil de Usar',
      description: 'Interfaz intuitiva para estudiantes, instructores y administradores'
    }
  ];

  const features = [
    'Control de entrada y salida',
    'Asignación inteligente de celdas',
    'Sistema de reservas',
    'Reconocimiento automático de placas',
    'Reportes y estadísticas',
    'Gestión de incidentes'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-screen flex-col items-center justify-center py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Logo/Brand */}
              <div className="flex items-center justify-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-4 shadow-xl">
                  <Car className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-6xl font-bold text-gray-900">
                  Park<span className="text-green-600">U</span>
                </h1>
              </div>

              {/* Headline */}
              <div className="max-w-3xl space-y-4">
                <h2 className="text-5xl font-bold leading-tight text-gray-900 sm:text-6xl">
                  Gestión Inteligente de Parqueaderos Universitarios
                </h2>
                <p className="mx-auto max-w-2xl text-xl text-gray-600">
                  Optimiza el control de acceso, ocupación y seguridad vehicular en tu institución educativa con tecnología moderna y eficiente
                </p>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <Button
                  size="lg"
                  className="group h-14 bg-green-600 px-8 text-lg font-semibold hover:bg-green-700"
                  onClick={() => navigate('/login')}
                >
                  Acceder al Sistema
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* Visual Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative mt-12"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-400 to-green-600 opacity-20 blur-3xl" />
                <div className="grid gap-4 sm:grid-cols-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="rounded-2xl border border-green-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
                    >
                      <benefit.icon className="mx-auto mb-4 h-10 w-10 text-green-600" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="mb-4 text-3xl font-bold text-gray-900">Funcionalidades Principales</h3>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
              Todo lo que necesitas para gestionar el parqueadero de tu universidad de manera eficiente
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left"
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <span className="font-medium text-gray-900">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-white">¿Listo para optimizar tu parqueadero?</h3>
            <p className="mx-auto max-w-2xl text-lg text-green-50">
              Inicia sesión ahora y comienza a gestionar tu parqueadero universitario de manera profesional
            </p>
            <Button
              size="lg"
              variant="outline"
              className="group h-14 border-2 border-white bg-white px-8 text-lg font-semibold text-green-700 hover:bg-green-50"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
