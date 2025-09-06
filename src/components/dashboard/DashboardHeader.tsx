'use client'

import { useSession, signOut } from 'next-auth/react'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardHeader() {
  const { data: session } = useSession()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Toggle theme</span>
            {isDark ? (
              <Sun className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Moon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleSignOut}
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Sign out</span>
              <LogOut className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}