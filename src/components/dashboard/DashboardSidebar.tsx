'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Settings, 
  BarChart3,
  Wallet
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trading', href: '/dashboard/trading', icon: TrendingUp },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: PieChart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4 shadow-lg">
        <div className="flex h-16 shrink-0 items-center">
          <Wallet className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            CryptoPortfolio
          </span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-200 dark:hover:bg-blue-900',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-blue-700 dark:text-blue-200' : 'text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-200',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}