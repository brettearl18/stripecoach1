'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BellIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Top bar */}
      <div className="pl-64">
        <div className="bg-white dark:bg-gray-800 h-16 fixed top-0 right-0 left-64 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-end h-full px-4 space-x-4">
            <ThemeToggle />
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                3
              </span>
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
} 