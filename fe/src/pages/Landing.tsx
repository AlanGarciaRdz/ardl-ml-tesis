import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { RegistrationForm } from './RegistrationForm';
import UserStatsBar from '../components/shared/UserStatsBar';
import { HeroVisualCard } from '../components/charts/HeroVisualCard';
import { Button } from '@radix-ui/themes'
import { BarChart3, Database, TrendingUp, Shield, Globe, Factory, Zap, Users, Award, LogOut, Menu, X } from 'lucide-react'  //ChevronRight
import logo from '@/assets/images/PITIAX-logo.png'
import socio1 from '@/assets/images/socios/ACC.png'
import socio2 from '@/assets/images/socios/ACEROS OCOTLAN.png'
import socio3 from '@/assets/images/socios/ARCELOR MITTAL.png'
import socio4 from '@/assets/images/socios/ARMASEL.png'
import socio5 from '@/assets/images/socios/GERDAU.png'
import socio6 from '@/assets/images/socios/HOME DEPOT.jpg'
import socio7 from '@/assets/images/socios/RECAL.png'
import socio8 from '@/assets/images/socios/SUACERO.png'



export function Landing() {
  const { login, logout, isLoggedIn, user, isRegistrationComplete } = useAuth();  //COMMENT THIS OUT FOR PRODUCTION

  const [material, setMaterial] = useState('');
  const [volumen, setVolumen] = useState('');
  const [cp, setCP] = useState('');
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate()


  const handleLogin = async () => {
    try {
      await login();
      if (isLoggedIn && !isRegistrationComplete) {
        return <RegistrationForm onComplete={handleRegistrationComplete} />;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationForm(false);
    window.location.reload();
  };

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      handleLogin();
    } else if (!isRegistrationComplete) {
      setShowRegistrationForm(true);
    } else {
      navigate('/dashboard');
    }
  }

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const partners = [
    { id: 1, image: socio1, name: "Socio 1" },
    { id: 2, image: socio2, name: "Socio 2" },
    { id: 3, image: socio3, name: "Socio 3" },
    { id: 4, image: socio4, name: "Socio 4" },
    { id: 5, image: socio5, name: "Socio 5" },
    { id: 6, image: socio6, name: "Socio 6" },
    { id: 7, image: socio7, name: "Socio 7" },
    { id: 8, image: socio8, name: "Socio 8" },
  ]

  if (isLoggedIn && !isRegistrationComplete && showRegistrationForm) {
    return <RegistrationForm onComplete={handleRegistrationComplete} />;
  }

  if (isLoggedIn && !isRegistrationComplete && !showRegistrationForm) {
    setTimeout(() => setShowRegistrationForm(true), 100);
  }

  return (
    <div className="min-h-screen bg-[#fffdff] text-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#27348B] via-[#36A9E1] to-[#27348B]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,150,190,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2596be]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2ca6e1]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-md bg-white/90 border-b border-[#2596be]/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Pitiax Logo" className="w-auto h-10 sm:h-14 object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('quien-soy')} className="text-gray-800 hover:text-[#27348B] transition-colors duration-300 text-[16px] font-medium">¿Quién soy?</button>
            <button onClick={() => scrollToSection('que-hago')} className="text-gray-800 hover:text-[#27348B] transition-colors duration-300 text-[16px] font-medium">¿Qué hago?</button>
            <button onClick={() => scrollToSection('socios')} className="text-gray-800 hover:text-[#27348B] transition-colors duration-300 text-[16px] font-medium">Mis socios</button>
            <button onClick={() => scrollToSection('futuro')} className="text-gray-800 hover:text-[#27348B] transition-colors duration-300 text-[16px] font-medium">Hablemos del futuro</button>
            <button onClick={() => scrollToSection('futuro')} className="text-gray-800 hover:text-[#27348B] transition-colors duration-300 text-[16px] font-medium">Tu plan en acción</button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-[16px] text-gray-700">{user?.displayName?.split(' ')[0] || 'User'}</span>
                <Button variant="ghost" size="2" onClick={logout}><LogOut className="h-5 w-5" /></Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={handleLogin} className="text-[#27348B] hover:text-[#616cb5] transition-all duration-300">Sign In</Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-800 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay — fuera del nav para que cubra toda la pantalla correctamente */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel — slide desde la derecha */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src={logo} alt="Pitiax Logo" className="h-9 w-auto object-contain" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Auth — arriba de los links */}
            <div className="px-3 pt-4 pb-3 border-b border-gray-100">
              {isLoggedIn ? (
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm text-gray-600 font-medium">{user?.displayName || 'User'}</span>
                  <Button
                    variant="ghost"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-red-500 hover:bg-red-50 flex items-center gap-1.5 text-sm"
                  >
                    <LogOut className="h-4 w-4" />Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                  className="w-full bg-[#27348B] text-white hover:bg-[#36A9E1] transition-colors"
                >
                  Sign In
                </Button>
              )}
            </div>
            {/* Links */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {[
                { label: '¿Quién soy?', id: 'quien-soy' },
                { label: '¿Qué hago?', id: 'que-hago' },
                { label: 'Mis socios', id: 'socios' },
                { label: 'Hablemos del futuro', id: 'futuro' },
                { label: 'Tu plan en acción', id: 'futuro' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { scrollToSection(item.id); setMobileMenuOpen(false); }}
                  className="w-full text-left py-3 px-4 text-gray-700 hover:bg-[#27348B]/5 hover:text-[#27348B] rounded-xl transition-colors text-base font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {isLoggedIn && isRegistrationComplete && (
        <UserStatsBar
          cotizaciones={10} comprado={75000} tokens={5} variacion={1.6}
          cp={cp} nombreProyecto={nombreProyecto} material={material} volumen={volumen}
          onCPChange={setCP} onNombreProyectoChange={setNombreProyecto}
          onMaterialChange={setMaterial} onVolumenChange={setVolumen}
        />
      )}

      {/* ── HERO ── */}
      <div className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* Left copy */}
            <div>
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 border border-white/30 mb-4 md:mb-6">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white mr-2" />
                <span className="text-xs sm:text-sm text-white font-medium">Enfocado en el Mercado Mexicano</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
                Analítica de
                <span className="block text-white">Precios de Acero</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 md:mb-8 leading-relaxed max-w-lg drop-shadow-md">
                Plataforma líder en México para análisis de precios de acero en tiempo real,
                tendencias del mercado y predicciones inteligentes.
              </p>

              <div className="flex flex-col xs:flex-row gap-3 mb-8 sm:mb-12">
                <Button
                  size="3"
                  onClick={handleGetStarted}
                  className="bg-white text-[#27348B] hover:bg-[#36A9E1] hover:text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 w-full xs:w-auto"
                >
                  Comenzar Ahora
                </Button>
                <Button
                  size="3"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#27348B] px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg w-full xs:w-auto"
                >
                  Ver Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-white" />
                  <span className="font-medium">500+ Empresas</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-white" />
                  <span className="font-medium">Certificado ISO</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative mt-6 lg:mt-0">
              <HeroVisualCard />
              {/* Floating blobs — hidden on small screens */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#2ca6e1] to-[#41afe0] rounded-full blur-xl opacity-60 animate-bounce"></div>
              <div className="hidden sm:block absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#2596be] to-[#1772b5] rounded-full blur-xl opacity-60 animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUIEN SOY ── */}
      <div id="quien-soy" className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 md:mb-8 drop-shadow-lg">
                ¿Quién soy?
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-white/95 leading-relaxed">
                <p className="drop-shadow-md">
                  Soy una inteligencia artificial que usa datos históricos, macroeconómicos y domésticos.
                </p>
                <p className="drop-shadow-md">
                  Analizo lo que sucede en el mercado, genero pronósticos y te ayudo a tomar decisiones sobre tus proyectos e inversiones en base a un análisis inteligente de datos.
                </p>
                <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg bg-white/10 px-4 py-2 rounded-lg inline-block">
                  ¿Te interesa que hablemos del futuro?
                </p>
              </div>
            </div>

            <div className="relative mt-4 lg:mt-0">
              <div className="bg-gradient-to-br from-[#2596be]/10 to-[#2ca6e1]/10 rounded-3xl p-8 border border-[#2596be]/20 shadow-xl h-64 sm:h-80 md:h-96 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-[#2596be]" />
                  </div>
                  <p className="text-sm">Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div id="que-hago" className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { Icon: Database, value: '50M+', label: 'Puntos de Datos', from: '[#27348B]', to: '[#36A9E1]' },
              { Icon: TrendingUp, value: '99.9%', label: 'Disponibilidad', from: '[#36A9E1]', to: '[#27348B]' },
              { Icon: Factory, value: '200+', label: 'Proveedores', from: '[#27348B]', to: '[#36A9E1]' },
              { Icon: Zap, value: '<2s', label: 'Tiempo de Respuesta', from: '[#36A9E1]', to: '[#27348B]' },
            ].map(({ Icon, value, label, from, to }) => (
              <div key={label} className="text-center group cursor-pointer">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-${from} to-${to} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">{value}</div>
                <div className="text-xs sm:text-sm text-white/90 font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">¿Qué hago?</h2>
            <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto">Características Principales</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {[
              { icon: BarChart3, color: 'from-[#2596be] to-[#2ca6e1]', title: 'Análisis Histórico de Precios', desc: 'Conservo y analizo el historial del comportamiento de precios por región en México, considerando las características específicas de cada proyecto.' },
              { icon: Globe, color: 'from-[#2ca6e1] to-[#41afe0]', title: 'Seguimiento del Mercado Regional', desc: 'Actualizo en tiempo real los precios de cada región de México de acuerdo con el comportamiento del mercado.' },
              { icon: Shield, color: 'from-[#41afe0] to-[#2596be]', title: 'Monitor de Noticias Económicas', desc: 'Centralizo y sintetizo las noticias nacionales e internacionales con impacto potencial en el mercado y los precios.' },
              { icon: Factory, color: 'from-[#1772b5] to-[#2596be]', title: 'Modelado de Precios Futuros', desc: 'Analizo y proyecto distintos escenarios futuros del comportamiento de los precios para apoyar la toma conjunta de decisiones.' },
              { icon: Database, color: 'from-[#2596be] to-[#2ca6e1]', title: 'Comparativo Regional y Sectorial', desc: 'Identifico patrones y diferencias de precios entre regiones y sectores en México para descubrir oportunidades y optimizar decisiones estratégicas.' },
              { icon: Zap, color: 'from-[#2ca6e1] to-[#41afe0]', title: 'Conexión Financiera en Tiempo Real', desc: 'Nos conectamos a fuentes financieras externas e internas mediante una API ultrarrápida que integra datos de precios en tiempo real directamente en tus aplicaciones.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group cursor-pointer">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 md:p-8 border border-[#2596be]/20 hover:border-[#2596be]/50 transition-all duration-500 hover:scale-105 h-full shadow-lg">
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3">{title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PARTNERS ── */}
      <div id="socios" className="relative z-10 w-full py-14 sm:py-20">
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2596be] to-[#1772b5] opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

          <div className="relative z-10 px-4 sm:px-8 md:px-12 py-10 sm:py-16 md:py-20">
            <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-8">Mis socios</h2>
              <div className="space-y-4 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-4xl">
                <p>Esto no lo hago sola necesitamos el pasado y el presente para conocer nuestro futuro por eso contamos con socios que aportan a la información del mercado.</p>
                <p>Nuestros socios se forman de proveedores y compradores, juntos logramos consolidar suficiente información para entender el pasado, presente y nuestro futuro.</p>
              </div>
            </div>

            {/* Scrolling Logos */}
            <div className="relative overflow-hidden mt-10 sm:mt-16">
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
                {[...partners, ...partners].map((partner, idx) => (
                  <div key={`logo-${idx}`} className="flex-shrink-0 mx-4 sm:mx-8">
                    <div className="w-28 h-18 sm:w-40 sm:h-24 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-center hover:bg-white/80 transition-all duration-300 px-2">
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-24 h-14 sm:w-36 sm:h-20 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DASHBOARD PREVIEW ── */}
      <div className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-6">Dashboard en Acción</h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12">Visualiza datos complejos de manera simple e intuitiva</p>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-[#2596be]/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

              {/* Chart panel */}
              <div className="lg:col-span-2">
                <div className="bg-[#2596be]/5 rounded-xl p-4 sm:p-6 h-auto sm:h-64">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">Tendencias de Precios</h4>
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#2596be] rounded-full"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#2ca6e1] rounded-full"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#41afe0] rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-32 sm:h-40 relative overflow-hidden">
                    <svg className="w-full h-full">
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2596be" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#2596be" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 120 Q 100 80 200 100 T 400 90 T 600 70" stroke="#2596be" strokeWidth="3" fill="none" className="animate-pulse" />
                      <path d="M 0 120 Q 100 80 200 100 T 400 90 T 600 70 V 160 H 0 Z" fill="url(#gradient1)" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
                <div className="bg-[#2596be]/5 rounded-xl p-3 sm:p-4">
                  <div className="text-xs text-gray-500 mb-1">Top Producto</div>
                  <div className="text-sm sm:text-lg font-bold text-gray-800">Acero Inoxidable</div>
                  <div className="text-xs text-green-600">+15.2% este mes</div>
                </div>
                <div className="bg-[#2596be]/5 rounded-xl p-3 sm:p-4">
                  <div className="text-xs text-gray-500 mb-1">Alerta Activa</div>
                  <div className="text-sm sm:text-lg font-bold text-[#2596be]">Precio Objetivo</div>
                  <div className="text-xs text-gray-600">$13,100 MXN/ton</div>
                </div>
                <div className="bg-[#2596be]/5 rounded-xl p-3 sm:p-4">
                  <div className="text-xs text-gray-500 mb-1">Próxima Actualización</div>
                  <div className="text-sm sm:text-lg font-bold text-[#2ca6e1]">En Vivo</div>
                  <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Conectado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div id="futuro" className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-[#2596be]/20 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
              ¿Listo para Revolucionar tu
              <span className="bg-gradient-to-r from-[#2596be] to-[#2ca6e1] bg-clip-text text-transparent"> Análisis?</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Únete a las empresas líderes en México que confían en nuestra plataforma para tomar decisiones informadas sobre precios de acero
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
              <Button
                size="3"
                onClick={handleGetStarted}
                className="bg-[#27348B] hover:bg-[#36A9E1] text-white px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                Acceder al Dashboard
              </Button>
              <Button
                size="3"
                variant="outline"
                className="border-[#27348B] text-[#27348B] hover:bg-[#27348B] hover:text-white px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Solicitar Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
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

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 md:py-12 border-t border-[#2596be]/20 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <img src={logo} alt="Pitiax Logo" className="w-auto h-10 sm:h-14 object-contain" />
              <div className="text-xs text-[#2596be] mt-1">Analisis precios de Acero</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-gray-500 text-xs sm:text-sm">© 2025 Pitiax Analytics. Todos los derechos reservados.</div>
              <div className="text-gray-400 text-xs mt-1">Hecho con ❤️ en México</div>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
