'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/coach/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/coach/clients', icon: UsersIcon },
  { name: 'Templates', href: '/coach/templates-v2', icon: Squares2X2Icon },
  { name: 'Settings', href: '/coach/settings', icon: Cog6ToothIcon },
  { name: 'Forms', href: '/coach/forms', icon: ClipboardDocumentListIcon },
  { name: 'Check-ins', href: '/coach/check-ins', icon: ChatBubbleLeftRightIcon },
  { name: 'Messages', href: '/coach/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/coach/analytics', icon: ChartBarIcon },
];

export default function DashboardNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {isExpanded ? (
          <h1 className="text-xl font-bold">Coach Portal</h1>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-bold">C</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors relative group",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {isExpanded ? (
                    <span className="ml-3">{item.name}</span>
                  ) : (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn(
        "p-4 border-t border-gray-800",
        isExpanded ? "block" : "hidden"
      )}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700" />
          <div className="ml-3">
            <p className="text-sm font-medium">Coach Account</p>
            <p className="text-xs text-gray-400">View Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
} 