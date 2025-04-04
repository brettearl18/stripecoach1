'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { name: 'Coaches', href: '/admin/coaches', icon: AcademicCapIcon },
  { name: 'Clients', href: '/admin/clients', icon: UserGroupIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: DocumentChartBarIcon },
  { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Check-ins', href: '/admin/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Programs', href: '/admin/programs', icon: DocumentTextIcon },
  { name: 'Reports', href: '/admin/reports', icon: DocumentChartBarIcon },
  { name: 'Billing', href: '/admin/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your platform</p>
      </div>
      
      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 