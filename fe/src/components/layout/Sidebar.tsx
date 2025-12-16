import { Link, NavLink } from 'react-router-dom'
import {
  BarChart3,
  Database,
  Settings,
  Home,
  TrendingUp
} from 'lucide-react'
import logo from '@/assets/images/PITIAX-logo.png'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data Explorer', href: '/dashboard/data', icon: Database },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  // { name: 'Forecasting', href: '/dashboard/forecasting', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 ">
      <div className="flex-1 flex flex-col min-h-0 border-r bg-white/90 border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
          <Link to="/" className="flex items-center">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Pitiax Logo" className="w-21 h-16 object-contain" />
          </div>
            </Link>
            {/* <h1 className="text-xl font-semibold text-gray-900">Steel Dashboard</h1> */}
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="mr-3 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
