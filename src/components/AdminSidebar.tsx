'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Coaches', href: '/admin/coaches', icon: UserGroupIcon },
  { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  { name: 'Clients', href: '/admin/clients', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Billing', href: '/admin/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Stripe Coach
          </Link>
        </div>
        <div className="mt-8 flex flex-grow flex-col">
          <nav className="flex-1 space-y-1 bg-white px-2" aria-label="Sidebar">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-gray-200 p-4">
          <Link
            href="/admin/settings"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Cog6ToothIcon
              className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
              aria-hidden="true"
            />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
} 