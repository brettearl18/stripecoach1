'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
  { name: 'Client List', href: '/coach/clients', icon: UsersIcon },
  { name: 'Check-ins', href: '/coach/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Messages', href: '/coach/messages', icon: ChatBubbleLeftIcon },
  { name: 'Analytics', href: '/coach/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/coach/settings', icon: Cog6ToothIcon },
];

export function CoachNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-white">Coach Dashboard</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="hidden md:block">
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 