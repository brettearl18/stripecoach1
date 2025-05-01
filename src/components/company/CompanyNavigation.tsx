'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Settings,
  FileText,
  BarChart,
  Bell,
  Shield,
  Building
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/company/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Coaches',
    href: '/company/coaches',
    icon: UserCircle,
    subItems: [
      { name: 'All Coaches', href: '/company/coaches' },
      { name: 'Coach Performance', href: '/company/coaches/performance' },
      { name: 'Coach Training', href: '/company/coaches/training' }
    ]
  },
  {
    name: 'Clients',
    href: '/company/clients',
    icon: Users,
    subItems: [
      { name: 'All Clients', href: '/company/clients' },
      { name: 'Client Progress', href: '/company/clients/progress' },
      { name: 'Client Support', href: '/company/clients/support' }
    ]
  },
  {
    name: 'Resources',
    href: '/company/resources',
    icon: FileText,
    subItems: [
      { name: 'Training Materials', href: '/company/resources/training' },
      { name: 'Templates', href: '/company/resources/templates' },
      { name: 'Documents', href: '/company/resources/documents' }
    ]
  },
  {
    name: 'Analytics',
    href: '/company/analytics',
    icon: BarChart,
    subItems: [
      { name: 'Performance', href: '/company/analytics/performance' },
      { name: 'Usage', href: '/company/analytics/usage' },
      { name: 'Reports', href: '/company/analytics/reports' }
    ]
  },
  {
    name: 'Settings',
    href: '/company/settings',
    icon: Settings,
    subItems: [
      { name: 'Company Profile', href: '/company/settings/profile' },
      { name: 'Billing', href: '/company/settings/billing' },
      { name: 'Preferences', href: '/company/settings/preferences' }
    ]
  }
];

export function CompanyNavigation() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const isExpanded = expandedItems.includes(item.name);
        const Icon = item.icon;

        return (
          <div key={item.name}>
            <Link
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
              onClick={() => item.subItems && toggleItem(item.name)}
            >
              <Icon
                className={`
                  mr-3 h-6 w-6
                  ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `}
              />
              {item.name}
              {item.subItems && (
                <span className="ml-auto">
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </Link>
            {item.subItems && isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className={`
                      block px-3 py-2 text-sm font-medium rounded-md
                      ${pathname === subItem.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
} 