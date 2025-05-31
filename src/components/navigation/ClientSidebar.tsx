import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clientNavigation } from './navigationConfig';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ClientSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Responsive: collapse sidebar on small screens by default
  // (You can enhance this with a useEffect + window.innerWidth if desired)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-lg ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      aria-label="Client sidebar navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/client/dashboard" className="flex items-center group" aria-label="Client Portal Home">
          {isOpen ? (
            <span className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Client Portal
            </span>
          ) : (
            <span className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              CP
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDoubleRightIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Main navigation">
        {clientNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {isOpen ? (
                <span className="ml-3 truncate">{item.name}</span>
              ) : (
                <span className="sr-only">{item.name}</span>
              )}
              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex-shrink-0">
          {/* Placeholder for avatar, can be replaced with user image */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 dark:from-blue-700 dark:to-blue-400 flex items-center justify-center text-white font-bold">
            {/* Optionally, show initials or icon */}
            <span>C</span>
          </div>
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            {/* Placeholder for user name, can be replaced with real data */}
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Client Name
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Welcome
            </p>
          </div>
        )}
      </div>
    </aside>
  );
} 