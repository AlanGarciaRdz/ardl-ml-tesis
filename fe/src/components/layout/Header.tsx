import {  LogOut } from 'lucide-react'
import { Button } from '@radix-ui/themes'
//import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth();
  //const navigate = useNavigate();

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/');
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };

  return (
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
  )
}
