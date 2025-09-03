import { useNavigate } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { BarChart3, Database, TrendingUp, Shield, Globe, Factory, Zap, Users, Award, ChevronRight } from 'lucide-react'

export function Landing() {
    const navigate = useNavigate()
  
    const handleGetStarted = () => {
      navigate('/dashboard')
    }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Pitiax</span>
              <div className="text-xs text-blue-300">Analytics Platform</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleGetStarted}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all duration-300"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 mb-6">
                <Globe className="w-4 h-4 text-blue-300 mr-2" />
                <span className="text-sm text-blue-200">Enfocado en el Mercado Mexicano</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Analítica de
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">
                  Precios de Acero
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                Plataforma líder en México para análisis de precios de acero en tiempo real, 
                tendencias del mercado y predicciones inteligentes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="4" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Comenzar Ahora
                </Button>
                <Button 
                  size="4" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Ver Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>500+ Empresas</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  <span>Certificado ISO</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Precio del Acero - Tiempo Real</h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Mock Chart */}
                  <div className="h-48 bg-gradient-to-t from-blue-900/50 to-transparent rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-end justify-between h-full space-x-2">
                      {[65, 72, 58, 81, 67, 89, 94, 76, 88, 95, 87, 92].map((height, i) => (
                        <div 
                          key={i}
                          className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-t flex-1 transition-all duration-1000 hover:from-blue-300 hover:to-purple-400"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-400">Ene 2025</span>
                    <span className="text-green-400 font-semibold">+12.5% ↗</span>
                    <span className="text-gray-400">Aug 2025</span>
                  </div>
                </div>

                {/* Live Data Simulation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Acero Estructural</div>
                    <div className="text-lg font-bold text-white">$18,450</div>
                    <div className="text-xs text-green-400">+2.3%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Varilla Corrugada</div>
                    <div className="text-lg font-bold text-white">$16,890</div>
                    <div className="text-xs text-red-400">-1.1%</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-60 animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">50M+</div>
              <div className="text-gray-400">Puntos de Datos</div>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Disponibilidad</div>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Factory className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">200+</div>
              <div className="text-gray-400">Proveedores</div>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">&lt;2s</div>
              <div className="text-gray-400">Tiempo de Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Características Principales
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Herramientas avanzadas diseñadas específicamente para el mercado mexicano del acero
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Análisis Predictivo</h3>
                <p className="text-gray-300 mb-4">
                  Algoritmos de IA para predecir tendencias de precios del acero con precisión del 94%
                </p>
                <div className="flex items-center text-blue-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Mercado Mexicano</h3>
                <p className="text-gray-300 mb-4">
                  Datos específicos de México incluyendo CDMX, Monterrey, Guadalajara y principales centros industriales
                </p>
                <div className="flex items-center text-green-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Alertas Inteligentes</h3>
                <p className="text-gray-300 mb-4">
                  Notificaciones automáticas cuando los precios alcanzan tus umbrales personalizados
                </p>
                <div className="flex items-center text-purple-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-orange-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Factory className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Integración Industrial</h3>
                <p className="text-gray-300 mb-4">
                  Conecta con tus sistemas ERP y obtén insights directamente en tu flujo de trabajo
                </p>
                <div className="flex items-center text-orange-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-teal-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Datos Históricos</h3>
                <p className="text-gray-300 mb-4">
                  Acceso a 10 años de datos históricos de precios de acero en México
                </p>
                <div className="flex items-center text-teal-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-pink-400/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">API Lightning</h3>
                <p className="text-gray-300 mb-4">
                  API ultrarrápida para integrar datos de precios en tiempo real en tus aplicaciones
                </p>
                <div className="flex items-center text-pink-400 text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dashboard Preview */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Dashboard en Acción
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Visualiza datos complejos de manera simple e intuitiva
          </p>
          
          {/* Mock Dashboard */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 rounded-xl p-6 h-64">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">Tendencias de Precios</h4>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Animated Line Chart Simulation */}
                  <div className="h-40 relative overflow-hidden">
                    <svg className="w-full h-full">
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 120 Q 100 80 200 100 T 400 90 T 600 70"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        fill="none"
                        className="animate-pulse"
                      />
                      <path
                        d="M 0 120 Q 100 80 200 100 T 400 90 T 600 70 V 160 H 0 Z"
                        fill="url(#gradient1)"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Right Panel */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Top Producto</div>
                  <div className="text-lg font-bold text-white">Acero Inoxidable</div>
                  <div className="text-sm text-green-400">+15.2% este mes</div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Alerta Activa</div>
                  <div className="text-lg font-bold text-yellow-400">Precio Objetivo</div>
                  <div className="text-sm text-gray-300">$17,500 MXN/ton</div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Próxima Actualización</div>
                  <div className="text-lg font-bold text-blue-400">En Vivo</div>
                  <div className="flex items-center text-sm text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Conectado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para Revolucionar tu
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Análisis?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a las empresas líderes en México que confían en nuestra plataforma 
              para tomar decisiones informadas sobre precios de acero
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="4" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Acceder al Dashboard
                
              </Button>
              <Button 
                size="4" 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg"
              >
                Solicitar Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-400" />
                <span>Seguridad Empresarial</span>
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2 text-blue-400" />
                <span>Datos Certificados</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">Pitiax</span>
                <div className="text-xs text-gray-400">Líder en Analytics de Acero</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-gray-400 text-sm">
                © 2025 Pitiax Analytics. Todos los derechos reservados.
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Hecho con ❤️ en México
              </div>
            </div>
          </div>
        </div>
      </footer>

     
    </div>
  )
}