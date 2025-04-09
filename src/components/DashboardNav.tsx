'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  badge?: number;
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Coaches', href: '/admin/coaches' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Settings', href: '/admin/settings' },
    { name: 'Calendar', href: '/admin/calendar' },
    { name: 'Messages', href: '/admin/messages' },
    { name: 'Check-ins', href: '/admin/check-ins' },
    { name: 'Programs', href: '/admin/programs' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Billing', href: '/admin/billing' },
  ],
  coach: [
    { name: 'Dashboard', href: '/coach/dashboard' },
    { name: 'Dashboard 2', href: '/coach/dashboard2' },
    { name: 'Clients', href: '/coach/clients' },
    { name: 'Client Overview', href: '/coach/client2' },
    { name: 'Messages', href: '/coach/messages', badge: 2 },
    { name: 'Analytics', href: '/coach/analytics' },
    { name: 'Settings', href: '/coach/settings' },
  ],
  client: [
    { name: 'Dashboard', href: '/client/dashboard' },
    { name: 'Progress', href: '/client/progress' },
    { name: 'Check-ins', href: '/client/check-ins' },
    { name: 'Food Scanner', href: '/client/food-scanner' },
    { name: 'Messages', href: '/client/messages' },
    { name: 'Settings', href: '/client/settings' },
  ],
};

export function DashboardNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const role = user?.role || 'client';
  const items = navItems[role] || [];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{role} Dashboard</h1>
              <p className="text-sm text-gray-500">{user?.name || user?.email}</p>
            </div>
            <nav className="hidden md:flex space-x-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative
                    ${pathname === item.href
                      ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  {item.name}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 