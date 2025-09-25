import { Bell, User } from 'lucide-react'
import { Button, Flex } from '@radix-ui/themes'
import { LanguageSwitcher } from '../LanguageSwitcher'

export function Header() {
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
        </Flex>
      </div>
    </header>
  )
}
