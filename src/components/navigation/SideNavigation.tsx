'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

interface SideNavigationProps {
  items: NavigationItem[];
  title: string;
  logo?: string;
  userRole: 'admin' | 'coach' | 'client';
}

export function SideNavigation({ items, title, logo, userRole }: SideNavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[#1C1C1F] transform transition-transform duration-300 ease-in-out md:translate-x-0',
          {
            'translate-x-0': isSidebarOpen,
            '-translate-x-full': !isSidebarOpen
          }
        )}
      >
        {/* Logo and title */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          {logo && (
            <img
              src={logo}
              alt={`${title} logo`}
              className="h-8 w-8 mr-3"
            />
          )}
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>

        {/* Navigation items */}
        <nav className="mt-6 px-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  {
                    'bg-indigo-600 text-white': isActive,
                    'text-gray-300 hover:bg-gray-800 hover:text-white': !isActive
                  }
                )}
              >
                <item.icon
                  className={cn('flex-shrink-0 h-5 w-5 mr-3', {
                    'text-white': isActive,
                    'text-gray-400 group-hover:text-white': !isActive
                  })}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      {
                        'bg-indigo-800 text-white': isActive,
                        'bg-gray-800 text-gray-300': !isActive
                      }
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role indicator */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <div className="flex items-center px-3 py-2 text-sm text-gray-400">
            <div className="flex-shrink-0 w-2 h-2 rounded-full mr-3 bg-emerald-400" />
            <span className="capitalize">{userRole} Account</span>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div
        className={cn('flex-1 transition-margin duration-300 ease-in-out', {
          'md:ml-64': isSidebarOpen
        })}
      >
        {/* Your page content goes here */}
      </div>
    </>
  );
} 