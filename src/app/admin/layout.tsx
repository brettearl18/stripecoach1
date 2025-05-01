'use client';

import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Temporarily disabled for development
  // useEffect(() => {
  //   if (!user || user.role !== 'admin') {
  //     router.push('/login');
  //   }
  // }, [user, router]);

  // if (!user || user.role !== 'admin') {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-white text-xl font-bold">Stripe Coach Admin</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <AdminNavigation />
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 