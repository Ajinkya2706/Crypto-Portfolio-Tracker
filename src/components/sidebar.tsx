'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: PieChart },
  { name: 'Trading', href: '/dashboard/trading', icon: TrendingUp },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden border-2 border-gray-300 dark:border-gray-600"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card border-r-2 border-border transition-all duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-16" : "w-64",
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b-2 border-border">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-foreground">Crypto Tracker</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex border-2 border-gray-300 dark:border-gray-600"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

