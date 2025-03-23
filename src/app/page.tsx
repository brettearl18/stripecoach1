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
  '/admin',
  '/admin/coaches',
  '/admin/clients',
  '/admin/analytics',
  '/admin/forms',
  '/admin/payments',
  '/admin/calendar',
  '/admin/settings',
  '/admin/avatars',
  '/coach/dashboard',
  '/coach/clients',
  '/coach/check-ins',
  '/coach/analytics',
  '/client/dashboard',
  '/client/coach',
  '/client/check-in',
  '/client/progress',
  '/client/messages',
  '/client/profile',
  '/client/settings',
  '/admin/sitemap'
];

// List of implemented footer links
const implementedFooterLinks = [
  '/admin/sitemap'
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
          href: '/admin',
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
          href: '/client/check-in',
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

        {/* Footer */}
        <footer className="bg-[#1A1F2B] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About Us</h3>
                <p className="text-gray-400">
                  Connecting clients with expert coaches for personalized fitness and wellness journeys.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/search" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/search') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Find a Coach
                      {!implementedFooterLinks.includes('/search') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                  <li>
                    <a href="/about" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/about') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      About Us
                      {!implementedFooterLinks.includes('/about') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/contact') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Contact
                      {!implementedFooterLinks.includes('/contact') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/blog" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/blog') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Blog
                      {!implementedFooterLinks.includes('/blog') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/faq') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      FAQ
                      {!implementedFooterLinks.includes('/faq') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${!implementedFooterLinks.includes('/privacy') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Privacy Policy
                      {!implementedFooterLinks.includes('/privacy') && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Development</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/admin/sitemap" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span>Site Map</span>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Dev</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Stripe Coach. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
