import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/coach/clients', icon: UserGroupIcon },
  { name: 'Check-ins', href: '/coach/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Analytics', href: '/coach/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/coach/settings', icon: Cog6ToothIcon },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/coach/dashboard" className="flex items-center">
          {isOpen ? (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Coach Portal
            </span>
          ) : (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              CP
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isOpen ? (
            <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDoubleRightIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              {isOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Michael Chen
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Head Coach
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 