'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-foreground">Crypto Portfolio</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border-2 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{session?.user?.name}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="border-2 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

