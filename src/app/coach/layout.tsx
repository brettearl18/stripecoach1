'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const navigation = [
  {
    name: 'Dashboard',
    href: '/coach',
    icon: '📊'
  },
  {
    name: 'Check-Ins',
    href: '/coach/check-ins',
    icon: '✅'
  },
  {
    name: 'Clients',
    href: '/coach/clients',
    icon: '👥'
  },
  {
    name: 'Programs',
    href: '/coach/programs',
    icon: '📋'
  },
  {
    name: 'Resources',
    href: '/coach/resources',
    icon: '📁'
  },
  {
    name: 'Analytics',
    href: '/coach/analytics',
    icon: '📈'
  }
];

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // DEV MODE: Always allow access
  // useEffect(() => {
  //   if (!loading && user) {
  //     // Check if user has coach role
  //     setIsAuthorized(user.role === 'coach');
  //   }
  // }, [user, loading]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // if (!isAuthorized) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
  //         <p className="mt-2 text-gray-600">You don't have permission to access this area.</p>
  //       </div>
  //     </div>
  //   );
  // }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Coach Portal</h2>
            <p className="text-sm text-gray-400 mt-1">Welcome, {user?.displayName || 'Coach'}</p>
          </div>

          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'}
                    `
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>

                {/* Subnav */}
                {item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={
                          `group flex items-center px-3 py-2 text-sm font-medium rounded-md
                          ${isActive(child.href)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                          `
                        }
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="pl-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
} 