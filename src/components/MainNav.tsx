'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UsersIcon,
  CreditCardIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
  { name: 'Check-ins', href: '/client/check-in', icon: ClipboardDocumentCheckIcon },
  { name: 'Messages', href: '/client/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Profile', href: '/client/profile', icon: UserCircleIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/admin/clients', icon: UsersIcon },
  { name: 'Check-ins', href: '/admin/check-ins', icon: ClipboardDocumentCheckIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Schedule', href: '/admin/schedule', icon: CalendarIcon },
];

export function MainNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const navigation = isAdmin ? adminNavigation : clientNavigation;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
                <span className="text-xl font-bold text-indigo-600">Stripe Coach</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-indigo-500 text-gray-900'
                        : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Settings button */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              href={isAdmin ? "/admin/settings" : "/client/settings"}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            );
          })}
          <Link
            href={isAdmin ? "/admin/settings" : "/client/settings"}
            className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            <div className="flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Settings
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
} 