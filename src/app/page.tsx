'use client';

import Link from 'next/link';
import {
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// List of implemented pages
const implementedPages = [
  '/admin/dashboard2',
  '/admin/coaches',
  '/admin/clients',
  '/admin/analytics',
  '/coach/dashboard',
  '/client/dashboard',
  '/client/check-in',
  '/admin/avatars'
];

interface NavigationSection {
  title: string;
  description: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
  }[];
}

export default function NavigationHub() {
  const sections: NavigationSection[] = [
    {
      title: 'Admin Dashboard',
      description: 'Business owner and administrator controls',
      items: [
        {
          name: 'Admin Dashboard',
          href: '/admin/dashboard2',
          icon: HomeIcon,
          description: 'Main admin dashboard with overview and controls'
        },
        {
          name: 'Business Avatars',
          href: '/admin/avatars',
          icon: UserCircleIcon,
          description: 'Create and manage business personas'
        },
        {
          name: 'Coach Management',
          href: '/admin/coaches',
          icon: UserGroupIcon,
          description: 'Manage coaches and their assignments'
        },
        {
          name: 'Client Management',
          href: '/admin/clients',
          icon: UserIcon,
          description: 'View and manage all clients'
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: ChartBarIcon,
          description: 'Platform-wide analytics and reporting'
        },
        {
          name: 'Forms & Check-ins',
          href: '/admin/forms',
          icon: ClipboardDocumentListIcon,
          description: 'Configure and monitor check-in forms'
        },
        {
          name: 'Payments',
          href: '/admin/payments',
          icon: CreditCardIcon,
          description: 'Track revenue and subscriptions'
        },
        {
          name: 'Calendar',
          href: '/admin/calendar',
          icon: CalendarIcon,
          description: 'Manage schedules and appointments'
        },
        {
          name: 'Notifications',
          href: '/admin/notifications',
          icon: BellIcon,
          description: 'System notifications and alerts'
        },
        {
          name: 'Settings',
          href: '/admin/settings',
          icon: Cog6ToothIcon,
          description: 'Platform configuration'
        }
      ]
    },
    {
      title: 'Coach Portal',
      description: 'Coach-specific features and controls',
      items: [
        {
          name: 'Coach Dashboard',
          href: '/coach/dashboard',
          icon: HomeIcon,
          description: 'Coach dashboard with client overview'
        },
        {
          name: 'My Clients',
          href: '/coach/clients',
          icon: UserIcon,
          description: 'Manage assigned clients'
        },
        {
          name: 'Check-ins',
          href: '/coach/check-ins',
          icon: ClipboardDocumentListIcon,
          description: 'Review client check-ins'
        },
        {
          name: 'Analytics',
          href: '/coach/analytics',
          icon: ChartBarIcon,
          description: 'Client progress analytics'
        }
      ]
    },
    {
      title: 'Client Portal',
      description: 'Client-facing features and interactions',
      items: [
        {
          name: 'Client Dashboard',
          href: '/client/dashboard',
          icon: HomeIcon,
          description: 'Client dashboard with progress overview'
        },
        {
          name: 'My Coach',
          href: '/client/coach',
          icon: UserGroupIcon,
          description: 'View coach information and contact'
        },
        {
          name: 'Check-ins',
          href: '/client/check-ins',
          icon: ClipboardDocumentListIcon,
          description: 'Submit and view check-ins'
        },
        {
          name: 'Progress',
          href: '/client/progress',
          icon: ChartBarIcon,
          description: 'Track personal progress'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Checkin.io</h1>
          <p className="text-xl text-gray-400">Select a section to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-[#1A1F2B] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <p className="text-gray-400 mb-6">{section.description}</p>
              <div className="space-y-4">
                {section.items.map((item) => {
                  const isImplemented = implementedPages.includes(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block bg-[#2A303C] rounded-lg p-4 hover:bg-[#3A404C] transition-colors ${
                        !isImplemented ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <item.icon className="h-6 w-6 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        {isImplemented ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
