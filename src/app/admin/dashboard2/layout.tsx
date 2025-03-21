'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard2', icon: HomeIcon },
  { name: 'Coaches', href: '/admin/coaches', icon: UserGroupIcon },
  { name: 'Clients', href: '/admin/clients', icon: UserIcon },
  { name: 'Forms', href: '/admin/forms', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0F15]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#1A1F2B] border-r border-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-[#2A303C] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {children}
      </div>
    </div>
  );
} 