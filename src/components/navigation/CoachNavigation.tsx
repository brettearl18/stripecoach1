'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
  { name: 'Client List', href: '/coach/client2', icon: UsersIcon },
  { name: 'Programs', href: '/coach/programs', icon: ClipboardDocumentCheckIcon },
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
              <span className="text-xl font-bold text-white">Stripe Coach</span>
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
                      } px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white p-1">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">Coach Name</div>
                <div className="text-sm font-medium leading-none text-gray-400 mt-1">coach@example.com</div>
              </div>
              <button className="ml-3 bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">CN</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 