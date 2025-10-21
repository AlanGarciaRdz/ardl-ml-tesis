import { Bell, User, LogOut } from 'lucide-react'
import { Button, Flex } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="md:hidden">
          <h1 className="text-lg font-semibold text-gray-900">Steel Dashboard</h1>
        </div>
        
        <Flex gap="4" align="center">
          <LanguageSwitcher />
          
          <Button variant="ghost" size="2">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="2">
            <User className="h-5 w-5" />
          </Button>

          {/* User info and logout */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {user?.displayName?.split(' ')[0] || 'User'}
            </span>
            <Button variant="ghost" size="2" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </Flex>
      </div>
    </header>
  )
}
