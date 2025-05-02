'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const tabs = [
  { name: 'Overview', href: '/coach/programs' },
  { name: 'Templates', href: '/coach/programs/templates' },
  { name: 'Active Programs', href: '/coach/programs/active' },
  { name: 'Archived', href: '/coach/programs/archived' }
];

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/coach/programs') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <ErrorBoundary>
      <div>
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Program sections">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${tab.name.toLowerCase()}-panel`}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6" role="tabpanel">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
} 