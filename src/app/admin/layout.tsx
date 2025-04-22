'use client';

import { SideNavigation } from '@/components/navigation/SideNavigation';
import { adminNavigation } from '@/components/navigation/navigationConfig';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121214]">
      <SideNavigation
        items={adminNavigation}
        title="Admin Portal"
        userRole="admin"
      />
      <main className="md:pl-64">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 