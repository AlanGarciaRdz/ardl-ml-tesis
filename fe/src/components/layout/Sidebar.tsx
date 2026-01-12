import { Link, NavLink } from 'react-router-dom'
import {
  BarChart3,
  Database,
  Settings,
  Home,
  TextQuote,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '@/assets/images/PITIAX-logo.png'
import { useState, useEffect } from 'react'

const navigation = [
  { nameKey: 'navigation.dashboard', href: '/dashboard', icon: Home, end: true, roles: ['admin', 'user'] },
  { nameKey: 'navigation.dataExplorer', href: '/dashboard/data', icon: Database, roles: ['admin'] },
  { nameKey: 'navigation.analytics', href: '/dashboard/analytics', icon: BarChart3, roles: [ 'user'] },
  // { nameKey: 'Forecasting', href: '/dashboard/forecasting', icon: TrendingUp },
  {nameKey : 'navigation.quotes', href: '/dashboard/quote', icon: TextQuote, roles: [ 'admin', 'user'] },
  { nameKey: 'navigation.settings', href: '/dashboard/settings', icon: Settings, roles: [ 'admin'] },
]

interface SidebarProps {
  isMobileMenuOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobileMenuOpen = false, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const [ userRole, setUserRole ] = useState<string>('user')

  // Load user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user'
    setUserRole(role)
  }, [])

  // Filter navigation items based on user role
  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex-1 flex flex-col h-full border-r bg-white border-gray-200 shadow-xl md:shadow-none">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Header with logo and close button */}
            <div className="flex items-center justify-between flex-shrink-0 px-4 mb-4">
              <Link to="/" className="flex items-center" onClick={handleNavClick}>
                <div className="flex items-center space-x-3">
                  <img src={logo} alt="Pitiax Logo" className="w-21 h-16 object-contain" />
                </div>
              </Link>
              {/* Close button - only visible on mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon              
                return (
                  <NavLink
                    key={item.nameKey}
                    to={item.href}
                    end={item.end}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 flex-shrink-0 h-6 w-6" />
                    {t(item.nameKey)}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
