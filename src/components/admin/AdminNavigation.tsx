'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  FileText,
  BarChart,
  Bell,
  Shield,
  Building,
  UserCircle,
  Users2,
  HelpCircle
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Companies',
    href: '/admin/companies',
    icon: Building,
    subItems: [
      { name: 'All Companies', href: '/admin/companies' },
      { name: 'Company Admins', href: '/admin/companies/admins' },
      { name: 'Company Settings', href: '/admin/companies/settings' }
    ]
  },
  {
    name: 'Coaches',
    href: '/admin/coaches',
    icon: UserCircle,
    subItems: [
      { name: 'All Coaches', href: '/admin/coaches' },
      { name: 'Coach Performance', href: '/admin/coaches/performance' },
      { name: 'Coach Training', href: '/admin/coaches/training' }
    ]
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users2,
    subItems: [
      { name: 'All Clients', href: '/admin/clients' },
      { name: 'Client Progress', href: '/admin/clients/progress' },
      { name: 'Client Support', href: '/admin/clients/support' }
    ]
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
    subItems: [
      { name: 'Tickets', href: '/admin/support/tickets' },
      { name: 'Knowledge Base', href: '/admin/support/kb' },
      { name: 'Training Materials', href: '/admin/support/training' }
    ]
  },
  {
    name: 'Pricing',
    href: '/admin/pricing',
    icon: CreditCard,
    subItems: [
      { name: 'Plans', href: '/admin/pricing/plans' },
      { name: 'Discounts', href: '/admin/pricing/discounts' },
      { name: 'Regional Pricing', href: '/admin/pricing/regional' }
    ]
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
    subItems: [
      { name: 'Revenue', href: '/admin/analytics/revenue' },
      { name: 'Usage', href: '/admin/analytics/usage' },
      { name: 'Performance', href: '/admin/analytics/performance' }
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    subItems: [
      { name: 'Platform', href: '/admin/settings/platform' },
      { name: 'Regional', href: '/admin/settings/regional' },
      { name: 'White Label', href: '/admin/settings/white-label' }
    ]
  }
];

export function AdminNavigation() {
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