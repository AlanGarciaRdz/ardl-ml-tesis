import { useNavigate } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { BarChart3, Database, TrendingUp, Shield, Globe, Factory, Zap, Users, Award, ChevronRight } from 'lucide-react'
import logo1 from '@/assets/images/logo1.png'

export function Landing() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#fffdff] text-gray-800 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f8] via-[#ffffff] to-[#f0f9fc]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,150,190,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2596be]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2ca6e1]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 backdrop-blur-md bg-white/80 border-b border-[#2596be]/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white p-2">
              <img src={logo1} alt="Pitiax Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#1772b5]">Pitiax</span>
              <div className="text-xs text-[#2596be]">Analytics Platform</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-700 hover:text-[#2596be] transition-colors duration-300 text-sm font-medium">
              ¿Quién soy?
            </button>
            <button className="text-gray-700 hover:text-[#2596be] transition-colors duration-300 text-sm font-medium">
              ¿Qué hago?
            </button>
            <button className="text-gray-700 hover:text-[#2596be] transition-colors duration-300 text-sm font-medium">
              Mis socios
            </button>
            <button className="text-gray-700 hover:text-[#2596be] transition-colors duration-300 text-sm font-medium">
              Hablemos del futuro
            </button>
            <Button
              variant="ghost"
              onClick={handleGetStarted}
              className=" text-[#2596be] hover:text-[#1772b5] border-[#2596be] transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#2596be]/10 border border-[#2596be]/30 mb-6">
                <Globe className="w-4 h-4 text-[#2596be] mr-2" />
                <span className="text-sm text-[#1772b5]">Enfocado en el Mercado Mexicano</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-gray-800">
                Analítica de
                <span className="bg-gradient-to-r from-[#2596be] to-[#2ca6e1] bg-clip-text text-transparent block">
                  Precios de Acero
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Plataforma líder en México para análisis de precios de acero en tiempo real,
                tendencias del mercado y predicciones inteligentes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="4"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#2596be] to-[#2ca6e1] hover:from-[#1772b5] hover:to-[#2596be] text-white px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Comenzar Ahora
                </Button>
                <Button
                  size="4"
                  variant="outline"
                  className="border-[#2596be] text-[#2596be] hover:bg-[#2596be]/10 px-8 py-4 text-lg"
                >
                  Ver Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#2596be]" />
                  <span>500+ Empresas</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-[#2596be]" />
                  <span>Certificado ISO</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#2596be]/20 shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Precio del Acero - Tiempo Real</h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Mock Chart */}
                  <div className="h-48 bg-gradient-to-t from-[#2596be]/20 to-transparent rounded-lg p-4 border border-[#2596be]/30">
                    <div className="flex items-end justify-between h-full space-x-2">
                      {[65, 72, 58, 81, 67, 89, 94, 76, 88, 95, 87, 92].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-[#2596be] to-[#2ca6e1] rounded-t flex-1 transition-all duration-1000 hover:from-[#1772b5] hover:to-[#2596be]"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-500">Ene 2025</span>
                    <span className="text-green-600 font-semibold">+12.5% ↗</span>
                    <span className="text-gray-500">Aug 2025</span>
                  </div>
                </div>

                {/* Live Data Simulation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#2596be]/5 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Acero Estructural</div>
                    <div className="text-lg font-bold text-gray-800">$18,450</div>
                    <div className="text-xs text-green-600">+2.3%</div>
                  </div>
                  <div className="bg-[#2596be]/5 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Varilla Corrugada</div>
                    <div className="text-lg font-bold text-gray-800">$16,890</div>
                    <div className="text-xs text-red-500">-1.1%</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-full blur-xl opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#2596be] to-[#1772b5] rounded-full blur-xl opacity-60 animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Who Am I Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
                ¿Quién soy?
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Soy una inteligencia artificial que usa datos históricos, macroeconómicos y domésticos.
                </p>
                <p>
                  Analizo lo que sucede en el mercado, genero pronósticos y te ayudo a tomar decisiones sobre tus proyectos e inversiones en base a un análisis inteligente de datos.
                </p>
                <p className="text-[#2596be] font-semibold text-xl">
                  ¿Te interesa que hablemos del futuro?
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#2596be]/10 to-[#2ca6e1]/10 rounded-3xl p-8 border border-[#2596be]/20 shadow-xl h-96 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-16 h-16 text-[#2596be]" />
                  </div>
                  <p className="text-sm">Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2596be] to-[#2ca6e1] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">50M+</div>
              <div className="text-gray-600">Puntos de Datos</div>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">99.9%</div>
              <div className="text-gray-600">Disponibilidad</div>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-[#41afe0] to-[#2596be] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Factory className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">200+</div>
              <div className="text-gray-600">Proveedores</div>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1772b5] to-[#2596be] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">&lt;2s</div>
              <div className="text-gray-600">Tiempo de Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              ¿Qué hago?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Características Principales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#2596be]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2596be] to-[#2ca6e1] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis Histórico de Precios</h3>
                <p className="text-gray-600 mb-4">
                Conservo y analizo el historial del comportamiento de precios por región en México, considerando las características específicas de cada proyecto.
                </p>
                <div className="flex items-center text-[#2596be] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#2ca6e1]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Seguimiento del Mercado Regional</h3>
                <p className="text-gray-600 mb-4">
                  Actualizo en tiempo real los precios de cada región de México de acuerdo con el comportamiento del mercado.
                </p>
                <div className="flex items-center text-[#2ca6e1] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#41afe0]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#41afe0] to-[#2596be] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Monitor de Noticias Económicas</h3>
                <p className="text-gray-600 mb-4">
                Centralizo y sintetizo las noticias nacionales e internacionales con impacto potencial en el mercado y los precios.
                </p>
                <div className="flex items-center text-[#41afe0] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#1772b5]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1772b5] to-[#2596be] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Factory className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Modelado de Precios Futuros</h3>
                <p className="text-gray-600 mb-4">
                  Analizo y proyecto distintos escenarios futuros del comportamiento de los precios para apoyar la toma conjunta de decisiones.
                </p>
                <div className="flex items-center text-[#1772b5] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#2596be]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2596be] to-[#2ca6e1] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Comparativo Regional y Sectorial</h3>
                <p className="text-gray-600 mb-4">
                Identifico patrones y diferencias de precios entre regiones y sectores en México para descubrir oportunidades y optimizar decisiones estratégicas.
                </p>
                <div className="flex items-center text-[#2596be] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#2596be]/20 hover:border-[#2ca6e1]/50 transition-all duration-500 hover:transform hover:scale-105 h-full shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Conexión Financiera en Tiempo Real</h3>
                <p className="text-gray-600 mb-4">
                Nos conectamos a fuentes financieras externas e internas mediante una API ultrarrápida que integra datos de precios en tiempo real directamente en tus aplicaciones, garantizando información actualizada y confiable para tus decisiones
                </p>
                <div className="flex items-center text-[#2ca6e1] text-sm font-semibold">
                  Ver más <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="relative z-10 w-full py-20">
        <div className="relative w-full overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2596be] to-[#1772b5] opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
          
          <div className="relative z-10 px-6 py-16 md:px-12 md:py-20">
            <div className="max-w-7xl mx-auto mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                Mis socios
              </h2>
              <div className="space-y-6 text-lg text-white/90 leading-relaxed max-w-4xl">
                <p>
                  Esto no lo hago sola necesitamos el pasado y el presente para conocer nuestro futuro por eso contamos con socios que aportan a la información del mercado.
                </p>
                <p>
                  Nuestros socios se forman de proveedores y compradores, juntos logramos consolidar suficiente información para entender el pasado, presente y nuestro futuro.
                </p>
              </div>
            </div>

            {/* Scrolling Partners Logos */}
            <div className="relative overflow-hidden mt-16">
              <style>{`
                @keyframes scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                  animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              <div className="flex animate-scroll">
                {/* First set of logos */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={`logo-${i}`} className="flex-shrink-0 mx-8">
                    <div className="w-40 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-center">
                        <Factory className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/40 text-xs">Socio {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={`logo-dup-${i}`} className="flex-shrink-0 mx-8">
                    <div className="w-40 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                      <div className="text-center">
                        <Factory className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/40 text-xs">Socio {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dashboard Preview */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Dashboard en Acción
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Visualiza datos complejos de manera simple e intuitiva
          </p>

          {/* Mock Dashboard */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#2596be]/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel */}
              <div className="lg:col-span-2">
                <div className="bg-[#2596be]/5 rounded-xl p-6 h-64">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Tendencias de Precios</h4>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-[#2596be] rounded-full"></div>
                      <div className="w-3 h-3 bg-[#2ca6e1] rounded-full"></div>
                      <div className="w-3 h-3 bg-[#41afe0] rounded-full"></div>
                    </div>
                  </div>

                  {/* Animated Line Chart Simulation */}
                  <div className="h-40 relative overflow-hidden">
                    <svg className="w-full h-full">
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2596be" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#2596be" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 120 Q 100 80 200 100 T 400 90 T 600 70"
                        stroke="#2596be"
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
                <div className="bg-[#2596be]/5 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-2">Top Producto</div>
                  <div className="text-lg font-bold text-gray-800">Acero Inoxidable</div>
                  <div className="text-sm text-green-600">+15.2% este mes</div>
                </div>

                <div className="bg-[#2596be]/5 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-2">Alerta Activa</div>
                  <div className="text-lg font-bold text-[#2596be]">Precio Objetivo</div>
                  <div className="text-sm text-gray-600">$13,100 MXN/ton</div>
                </div>

                <div className="bg-[#2596be]/5 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-2">Próxima Actualización</div>
                  <div className="text-lg font-bold text-[#2ca6e1]">En Vivo</div>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 border border-[#2596be]/20 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              ¿Listo para Revolucionar tu
              <span className="bg-gradient-to-r from-[#2596be] to-[#2ca6e1] bg-clip-text text-transparent"> Análisis?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a las empresas líderes en México que confían en nuestra plataforma
              para tomar decisiones informadas sobre precios de acero
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="4"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#2596be] to-[#2ca6e1] hover:from-[#1772b5] hover:to-[#2596be] text-white px-10 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Acceder al Dashboard
              </Button>
              <Button
                size="4"
                variant="outline"
                className="border-[#2596be] text-[#2596be] hover:bg-[#2596be]/10 px-10 py-4 text-lg"
              >
                Solicitar Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                <span>Seguridad Empresarial</span>
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2 text-[#2596be]" />
                <span>Datos Certificados</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#2ca6e1]" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-[#2596be]/20 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white p-2 shadow-md">
                <img src={logo1} alt="Pitiax Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[#1772b5] font-bold text-lg">Pitiax</span>
                <div className="text-xs text-[#2596be]">Líder en Analytics de Acero</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-gray-500 text-sm">
                © 2025 Pitiax Analytics. Todos los derechos reservados.
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Hecho con ❤️ en México
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}