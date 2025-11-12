import { LogOut, Phone, X } from 'lucide-react'
import { Button } from '@radix-ui/themes'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout, isLoggedIn, isPhoneVerified } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();

  // Show banner only if user is logged in and phone is not verified
  const shouldShowBanner = isLoggedIn && !isPhoneVerified && showBanner;

  return (
    <>
      {/* Phone Verification Banner */}
      {shouldShowBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Acción requerida:</span> Por favor valida tu número de teléfono para continuar usando la plataforma.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="1"
                onClick={() => navigate('/dashboard/settings')}
                className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
              >
                Validar ahora
              </Button>
              <button
                onClick={() => setShowBanner(false)}
                className="text-yellow-600 hover:text-yellow-800 p-1"
                aria-label="Cerrar banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          {/* Left side - add your logo or other content here if needed */}
          <div></div>
          
          {/* Right side - Language switcher and user info in one line */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {user?.displayName?.split(' ')[0] || 'User'}
              </span>
              <Button variant="ghost" size="2" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
